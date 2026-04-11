import type { AIProvider, AIProviderName } from './types';
import { claudeProvider } from './claude';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';

export * from './types';
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
