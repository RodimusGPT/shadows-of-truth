import { ChatRequest, ChatResponse, GameState } from '@shadows/shared';

function getApiBase(): string {
  // In web, try the Expo public env var first
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // In browser: use same origin — Metro proxies /api to the Fastify server.
  // This avoids CORS issues in cloud IDEs where each port is a different origin.
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

const API_BASE = getApiBase();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  console.log(`[API] ${options?.method ?? 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  return response.json();
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  listCases: () =>
    request<{ cases: Array<{ id: string; title: string; synopsis: string }> }>('/api/cases'),

  newGame: (caseId: string) =>
    request<{ gameId: string; state: GameState }>('/api/game/new', {
      method: 'POST',
      body: JSON.stringify({ caseId }),
    }),

  getGame: (gameId: string) =>
    request<{ state: GameState }>(`/api/game/${gameId}`),

  chat: (body: ChatRequest) =>
    request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
