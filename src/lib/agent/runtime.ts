import type { EvolutionIncomingMessage } from '@/lib/evolution';
import { getEvolutionClient } from '@/lib/evolution';
import type { AIMessage, AIProvider } from '@/lib/ai';
import { getAIProvider } from '@/lib/ai';
import {
    getTenantBySlug,
    getTenantHours,
    getTenantExceptions,
    upsertCustomer,
    appendMessage,
    getRecentMessages,
    getLastOrderByCustomer,
} from '@/lib/db/queries';
import { isOpenNow, formatHoursHuman } from '@/lib/hours';
import type { Tenant, Customer } from '@/lib/db/types';
import { buildSystemPrompt } from './prompt';
import { agentTools, executeToolCall } from './tools';

const MAX_HISTORY = 20;
const MAX_TOOL_ROUNDS = 3;

export async function handleIncomingMessage(
    msg: EvolutionIncomingMessage
): Promise<void> {
    // TODO FASE 3: map Evolution instance -> tenant via a dedicated instances table.
    // Why: for now the instance name IS the tenant slug. This will split into customer/admin instances later.
    const tenant = await getTenantBySlug(msg.instance);
    if (!tenant) {
        console.warn('[agent] no tenant for instance', msg.instance);
        return;
    }

    const customer = await upsertCustomer({
        tenantId: tenant.id,
        phone: msg.phoneE164,
        name: msg.pushName ?? undefined,
    });

    if (customer.blocked) {
        await sendAndLog(
            tenant,
            customer,
            msg,
            `Olá! Identificamos uma pendência na sua conta${customer.blockReason ? ` (${customer.blockReason})` : ''}. Por favor, entre em contato diretamente com o restaurante para resolver.`
        );
        return;
    }

    await appendMessage({
        tenantId: tenant.id,
        customerId: customer.id,
        role: 'user',
        content: msg.text,
    });

    const hours = await getTenantHours(tenant.id);
    const today = new Date().toISOString().slice(0, 10);
    const in14Days = new Date(Date.now() + 14 * 86_400_000)
        .toISOString()
        .slice(0, 10);
    const exceptions = await getTenantExceptions(tenant.id, today, in14Days);
    const openState = isOpenNow(hours, exceptions);

    if (tenant.vacationMode || !openState.open) {
        const hoursHuman = formatHoursHuman(hours);
        const reply = tenant.vacationMode
            ? `No momento estamos em pausa/férias. Voltamos em breve 🙏`
            : `No momento estamos fechados. Nosso horário de funcionamento:\n\n${hoursHuman}\n\nRetornaremos seu contato na próxima abertura 😊`;
        await sendAndLog(tenant, customer, msg, reply);
        return;
    }

    const lastOrder = await getLastOrderByCustomer(customer.id);
    const history = await getRecentMessages(customer.id, MAX_HISTORY);

    const nowLocal = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(new Date());

    const systemPrompt = buildSystemPrompt({
        tenant,
        customer,
        hoursHuman: formatHoursHuman(hours),
        openState,
        lastOrder,
        nowLocal,
    });

    const provider = getAIProvider(tenant.aiProvider);
    const aiMessages: AIMessage[] = history.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
    }));

    const reply = await runAgentLoop(
        provider,
        systemPrompt,
        aiMessages,
        tenant,
        customer
    );

    if (reply.trim().length > 0) {
        await sendAndLog(tenant, customer, msg, reply);
    }
}

async function runAgentLoop(
    provider: AIProvider,
    system: string,
    messages: AIMessage[],
    tenant: Tenant,
    customer: Customer
): Promise<string> {
    let workingMessages = [...messages];
    let finalText = '';

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const response = await provider.chat({
            system,
            messages: workingMessages,
            tools: agentTools,
            maxTokens: 1024,
            temperature: 0.7,
        });

        if (response.text) finalText = response.text;

        if (response.toolCalls.length === 0) {
            break;
        }

        const toolResults = await Promise.all(
            response.toolCalls.map((call) =>
                executeToolCall(call, { tenant, customer })
            )
        );

        // Why: providers differ in how they want tool results threaded back.
        // We flatten to a synthetic user turn containing a structured tool-result
        // block so all three providers (Claude/GPT/Gemini) can interpret it
        // uniformly without custom per-provider handling in FASE 2.
        const toolSummary = toolResults
            .map((r) => `[tool:${r.name}] ${r.content}`)
            .join('\n');
        workingMessages = [
            ...workingMessages,
            { role: 'assistant', content: response.text || '(calling tools)' },
            {
                role: 'user',
                content: `Resultado das tools:\n${toolSummary}\n\nUse esse resultado para responder ao cliente em português de forma natural.`,
            },
        ];
    }

    return finalText;
}

async function sendAndLog(
    tenant: Tenant,
    customer: Customer,
    msg: EvolutionIncomingMessage,
    text: string
): Promise<void> {
    try {
        const evo = getEvolutionClient();
        await evo.sendText(msg.instance, msg.phoneE164, text);
    } catch (err) {
        console.error('[agent] failed to send via evolution', err);
    }
    await appendMessage({
        tenantId: tenant.id,
        customerId: customer.id,
        role: 'assistant',
        content: text,
    });
}
