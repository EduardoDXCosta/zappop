import type { AIProvider, AIProviderName } from './types.js';
import { claudeProvider } from './claude.js';
import { openaiProvider } from './openai.js';
import { geminiProvider } from './gemini.js';

export * from './types.js';
export { claudeProvider, openaiProvider, geminiProvider };

const providers: Record<AIProviderName, AIProvider> = {
  claude: claudeProvider,
  gpt: openaiProvider,
  gemini: geminiProvider,
};

export function getAIProvider(name: AIProviderName): AIProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown AI provider: ${name}`);
  return provider;
}
