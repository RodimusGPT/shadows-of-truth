import { ChatMessage } from '@shadows/shared';
import { LlmMessage } from '../llm/types';

const MAX_HISTORY_MESSAGES = 10; // Reduced from 20 to save ~500 tokens per request

/**
 * Builds the LLM conversation window:
 * - Pins the opening exchange (first 2 messages)
 * - Includes a sliding window of recent messages
 * - Prepends conversation summary if history was trimmed
 */
export function buildConversationWindow(
  chatHistory: ChatMessage[],
  conversationSummary: string,
  currentMessage: string
): LlmMessage[] {
  const messages: LlmMessage[] = [];

  if (chatHistory.length > MAX_HISTORY_MESSAGES && conversationSummary) {
    messages.push({
      role: 'user',
      content: `[Earlier conversation summary: ${conversationSummary}]`,
    });
    messages.push({
      role: 'assistant',
      content: '[Understood, continuing from where we left off.]',
    });
  }

  // Pin opening messages + sliding window of recent
  const pinned = chatHistory.slice(0, 2);
  const recent = chatHistory.length > MAX_HISTORY_MESSAGES
    ? chatHistory.slice(-MAX_HISTORY_MESSAGES + 2)
    : chatHistory.slice(2);

  const windowMessages = [...pinned, ...recent];

  for (const msg of windowMessages) {
    messages.push({
      role: msg.role === 'player' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  // Add the current player message
  messages.push({ role: 'user', content: currentMessage });

  return messages;
}
