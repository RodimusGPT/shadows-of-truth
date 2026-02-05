import { ChatRequest, ChatResponse, GameState } from '@shadows/shared';

const RENDER_API = 'https://shadows-of-truth-api.onrender.com';

function getApiBase(): string {
  // Explicit override via env var
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // In browser: if running on localhost, use same origin (Metro proxy for dev).
  // Otherwise (production static site), use the Render API.
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.origin;
    }
    return RENDER_API;
  }
  return 'http://localhost:3000';
}

const API_BASE = getApiBase();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  if (__DEV__) console.log(`[API] ${options?.method ?? 'GET'} ${url}`);

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

export interface CaseInfo {
  id: string;
  title: string;
  setting: string;
  synopsis: string;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  listCases: () => request<{ cases: CaseInfo[] }>('/api/cases'),

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
