import type { Customer } from '../../db/types.js';
import type { AIMessage } from '../ai/index.js';
import type { IsOpenResult } from '../hours.js';
import { getAIProvider } from '../ai/index.js';
import {
    getTenantById,
    getTenantHours,
    appendChat,
    getRecentChats,
} from '../../db/queries/index.js';
import { formatHoursHuman } from '../hours.js';
import { buildSystemPrompt } from './prompt.js';
import { agentTools, executeToolCall } from './tools.js';

const MAX_HISTORY = 20;
const MAX_TOOL_ROUNDS = 3;

export async function handleTestMessage(input: {
    tenantId: string;
    message: string;
}): Promise<{ reply: string; sessionId: string }> {
    const tenant = await getTenantById(input.tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const sessionId = `test_${input.tenantId}`;

    const fakeCustomer: Customer = {
        id: 'test',
        tenantId: tenant.id,
        phone: sessionId,
        name: 'Cliente Teste',
        notes: null,
        blocked: false,
        blockReason: null,
        lastOrderAt: null,
    };

    await appendChat({
        sessionId,
        tenantId: tenant.id,
        role: 'user',
        message: { content: input.message },
    });

    const history = await getRecentChats(sessionId, MAX_HISTORY);

    const hours = await getTenantHours(tenant.id);
    const hoursHuman = formatHoursHuman(hours);

    const systemPrompt = buildSystemPrompt({
        tenant,
        customer: fakeCustomer,
        defaultAddress: null,
        hoursHuman,
        openState: {
            open: true,
            currentShift: null,
            closesAt: null,
            nextOpensAt: null,
            reason: 'open',
            exceptionNote: null,
        } satisfies IsOpenResult,
        lastOrder: null,
        nowLocal: new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(new Date()),
    });

    const provider = getAIProvider(tenant.aiProvider);
    const aiMessages: AIMessage[] = history
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.message.content,
        }));

    let finalText = '';
    let workingMessages = [...aiMessages];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await provider.chat({
            system: systemPrompt,
            messages: workingMessages,
            tools: agentTools,
            maxTokens: 1024,
            temperature: 0.7,
        });

        if (response.text) finalText = response.text;

        if (response.toolCalls.length === 0) break;

        const toolResults = await Promise.all(
            response.toolCalls.map((call) =>
                executeToolCall(call, { tenant, customer: fakeCustomer, defaultAddress: null, sessionId })
            )
        );

        const toolSummary = toolResults
            .map((r) => `[tool:${r.name}] ${r.content}`)
            .join('\n');

        await appendChat({
            sessionId,
            tenantId: tenant.id,
            role: null,
            message: {
                content: toolSummary,
                type: 'tool_result',
                toolCalls: response.toolCalls,
            },
        });

        workingMessages = [
            ...workingMessages,
            { role: 'assistant', content: response.text || '(calling tools)' },
            {
                role: 'user',
                content: `Resultado das tools:\n${toolSummary}\n\nUse esse resultado para responder ao cliente em português de forma natural.`,
            },
        ];
    }

    await appendChat({
        sessionId,
        tenantId: tenant.id,
        role: 'assistant',
        message: { content: finalText },
    });

    return { reply: finalText, sessionId };
}
