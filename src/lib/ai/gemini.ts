import { GoogleGenAI } from '@google/genai';
import type {
  AIChatRequest,
  AIChatResponse,
  AIProvider,
  AIToolCall,
} from './types';

// 2.5-flash is the fast/cheap tier suitable for an attendant. Callers can override.
const DEFAULT_MODEL = 'gemini-2.5-flash';

export const geminiProvider: AIProvider = {
  name: 'gemini',
  async chat(req: AIChatRequest): Promise<AIChatResponse> {
    const apiKey = req.apiKey ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Google API key not configured: set GOOGLE_API_KEY or pass apiKey override.',
      );
    }

    const client = new GoogleGenAI({ apiKey });
    const model = req.model ?? DEFAULT_MODEL;

    const contents = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        // Gemini uses 'model' instead of 'assistant' for its own turns.
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const tools = req.tools && req.tools.length > 0
      ? [
          {
            functionDeclarations: req.tools.map((t) => ({
              name: t.name,
              description: t.description,
              // parametersJsonSchema takes a raw JSON Schema object (vs. the
              // Gemini-specific Schema type used by `parameters`).
              parametersJsonSchema: t.inputSchema,
            })),
          },
        ]
      : undefined;

    const response = await client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: req.system,
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens ?? 1024,
        ...(tools ? { tools } : {}),
      },
    });

    let text = '';
    const toolCalls: AIToolCall[] = [];

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    parts.forEach((part, index) => {
      if (typeof part.text === 'string' && part.text.length > 0) {
        text += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          // Gemini may not return an id for tool calls; fall back to an index-based synthetic id.
          id: part.functionCall.id ?? `call_${index}`,
          name: part.functionCall.name ?? '',
          input: (part.functionCall.args ?? {}) as Record<string, unknown>,
        });
      }
    });

    const usage = response.usageMetadata;
    return {
      text,
      toolCalls,
      usage: usage
        ? {
            inputTokens: usage.promptTokenCount ?? 0,
            outputTokens: usage.candidatesTokenCount ?? 0,
          }
        : undefined,
      rawModel: response.modelVersion ?? model,
    };
  },
};
