import { FastifyInstance } from 'fastify';
import { v4 as uuid } from 'uuid';
import { ChatRequest, ChatResponse, ChatMessage } from '@shadows/shared';
import { createLlmProvider } from '../llm';
import { parseResponse } from '../llm/response-parser';
import { buildSystemPrompt, validateStateChanges, buildConversationWindow } from '../case-engine';
import { getGame, applyStateChanges, addMessage, dispatch } from '../game-state';
import { missingHeiress } from '../data/cases/missing-heiress';
import { CaseDefinition } from '@shadows/shared';

const cases: Record<string, CaseDefinition> = {
  'missing-heiress': missingHeiress,
};

export async function chatRoutes(app: FastifyInstance) {
  app.post<{ Body: ChatRequest }>('/api/chat', async (request, reply) => {
    const { gameId, message, targetNpcId } = request.body;

    const state = getGame(gameId);
    if (!state) {
      return reply.status(404).send({ error: 'Game not found' });
    }

    const caseDef = cases[state.caseId];
    if (!caseDef) {
      return reply.status(500).send({ error: 'Case definition not found' });
    }

    // Determine target NPC
    const npcId = targetNpcId ?? state.npcs.find((n) => n.locationId === state.currentLocationId)?.id;
    const npc = state.npcs.find((n) => n.id === npcId);
    if (!npc) {
      return reply.status(400).send({
        error: 'No NPC available at current location. Try moving to a location with an NPC.',
      });
    }

    // Mark NPC as introduced
    if (!npc.introduced) {
      dispatch(gameId, { type: 'UPDATE_MOOD', npcId: npc.id, mood: npc.mood });
    }

    // Record player message
    const playerMessage: ChatMessage = {
      id: uuid(),
      role: 'player',
      content: message,
      timestamp: Date.now(),
      turn: state.turn,
    };
    addMessage(gameId, playerMessage);

    // Build prompt and conversation
    const updatedState = getGame(gameId)!;
    const systemPrompt = buildSystemPrompt(caseDef, updatedState, npc);
    const conversationMessages = buildConversationWindow(
      updatedState.chatHistory,
      updatedState.conversationSummary,
      message
    );

    // Call LLM
    let llmProvider;
    try {
      llmProvider = createLlmProvider();
    } catch {
      // If no API key configured, return a mock response for development
      const mockMessage: ChatMessage = {
        id: uuid(),
        role: 'npc',
        content: `[Dev mode — no LLM configured] ${npc.name} regards you with ${npc.mood} eyes.`,
        npcId: npc.id,
        timestamp: Date.now(),
        turn: state.turn,
      };
      addMessage(gameId, mockMessage);
      dispatch(gameId, { type: 'INCREMENT_TURN' });
      const finalState = getGame(gameId)!;
      return {
        dialogue: mockMessage.content,
        stateChanges: {},
        message: mockMessage,
      } satisfies ChatResponse;
    }

    const llmResponse = await llmProvider.generate({
      systemPrompt,
      messages: conversationMessages,
      maxTokens: 1024,
      temperature: 0.8,
    });

    // Parse and validate response
    const parsed = parseResponse(llmResponse.content);
    const coherenceResult = validateStateChanges(parsed.stateChanges, caseDef, updatedState, npc);

    if (coherenceResult.violations.length > 0) {
      app.log.warn({ violations: coherenceResult.violations }, 'Coherence guard caught violations');
    }

    // Apply sanitized state changes
    applyStateChanges(gameId, coherenceResult.sanitized, updatedState.turn);

    // Record NPC response
    const npcMessage: ChatMessage = {
      id: uuid(),
      role: 'npc',
      content: parsed.dialogue,
      npcId: npc.id,
      timestamp: Date.now(),
      turn: state.turn,
    };
    addMessage(gameId, npcMessage);
    dispatch(gameId, { type: 'INCREMENT_TURN' });

    return {
      dialogue: parsed.dialogue,
      stateChanges: coherenceResult.sanitized,
      message: npcMessage,
    } satisfies ChatResponse;
  });
}
