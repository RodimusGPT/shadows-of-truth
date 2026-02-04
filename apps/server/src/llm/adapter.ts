import { LlmProvider, ProviderName } from './types';
import { createClaudeProvider } from './providers/claude';
import { createOpenAiProvider } from './providers/openai';
import { createGeminiProvider } from './providers/gemini';

export function createLlmProvider(provider?: ProviderName): LlmProvider {
  const name = provider ?? (process.env.LLM_PROVIDER as ProviderName) ?? 'claude';

  switch (name) {
    case 'claude': {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error('ANTHROPIC_API_KEY is required for Claude provider');
      return createClaudeProvider(key);
    }
    case 'openai': {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error('OPENAI_API_KEY is required for OpenAI provider');
      return createOpenAiProvider(key);
    }
    case 'gemini': {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error('GEMINI_API_KEY is required for Gemini provider');
      return createGeminiProvider(key);
    }
    default:
      throw new Error(`Unknown LLM provider: ${name}`);
  }
}
