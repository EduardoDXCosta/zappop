import OpenAI from 'openai';
import type {
  AIChatRequest,
  AIChatResponse,
  AIProvider,
  AIToolCall,
} from './types';

const DEFAULT_MODEL = 'gpt-4o-mini';

function parseArgs(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return {};
}

export const openaiProvider: AIProvider = {
  name: 'gpt',
  async chat(req: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = req.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAI API key not configured: set OPENAI_API_KEY or pass apiKey override.',
      );
    }

    const client = new OpenAI({ apiKey });
    const model = req.model ?? DEFAULT_MODEL;

    const tools = req.tools?.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      },
    }));

    const response = await client.chat.completions.create({
      model,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.7,
      messages: [
        { role: 'system', content: req.system },
        ...req.messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
      ],
      ...(tools && tools.length > 0 ? { tools } : {}),
    });

    const choice = response.choices[0];
    const message = choice?.message;
    const text = message?.content ?? '';

    const toolCalls: AIToolCall[] = [];
    for (const call of message?.tool_calls ?? []) {
      if (call.type === 'function') {
        toolCalls.push({
          id: call.id,
          name: call.function.name,
          input: parseArgs(call.function.arguments),
        });
      }
    }

    return {
      text,
      toolCalls,
      usage: response.usage
        ? {
            inputTokens: response.usage.prompt_tokens,
            outputTokens: response.usage.completion_tokens,
          }
        : undefined,
      rawModel: response.model,
    };
  },
};
