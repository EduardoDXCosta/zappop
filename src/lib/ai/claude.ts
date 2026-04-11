import Anthropic from '@anthropic-ai/sdk';
import type {
  AIChatRequest,
  AIChatResponse,
  AIProvider,
  AIToolCall,
} from './types';

// Sonnet is the production default for the attendant: substantially cheaper than Opus
// while strong enough for conversational restaurant support. Callers can override.
const DEFAULT_MODEL = 'claude-sonnet-4-5';

function assertInput(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  return {};
}

export const claudeProvider: AIProvider = {
  name: 'claude',
  async chat(req: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = req.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Anthropic API key not configured: set ANTHROPIC_API_KEY or pass apiKey override.',
      );
    }

    const client = new Anthropic({ apiKey });
    const model = req.model ?? DEFAULT_MODEL;

    const tools = req.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as { type: 'object'; [k: string]: unknown },
    }));

    const response = await client.messages.create({
      model,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.7,
      // cache_control on the system block enables prompt caching: the same long system
      // prompt is reused across every customer message, so this is a large cost win.
      system: [
        {
          type: 'text',
          text: req.system,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: req.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ...(tools && tools.length > 0 ? { tools } : {}),
    });

    let text = '';
    const toolCalls: AIToolCall[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: assertInput(block.input),
        });
      }
    }

    return {
      text,
      toolCalls,
      usage: {
        inputTokens: response.usage.input_tokens ?? 0,
        outputTokens: response.usage.output_tokens ?? 0,
      },
      rawModel: response.model,
    };
  },
};
