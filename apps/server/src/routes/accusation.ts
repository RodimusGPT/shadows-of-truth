import { FastifyInstance } from 'fastify';
import { Accusation } from '@shadows/shared';
import { getGame, dispatch } from '../game-state';
import { cases } from '../data/cases';
import { createLlmProvider } from '../llm';
import {
  evaluateAccusation,
  generateResolution,
  calculateDynamicThreshold,
} from '../case-engine/accusation-evaluator';

interface AccusationBody {
  gameId: string;
  suspectNpcId: string;
  motive: string;
  method: string;
  reasoning: string;
}

export async function accusationRoutes(app: FastifyInstance) {
  app.post<{ Body: AccusationBody }>('/api/accuse', async (request, reply) => {
    const { gameId, suspectNpcId, motive, method, reasoning } = request.body;

    // Validate input
    if (!gameId || typeof gameId !== 'string') {
      return reply.status(400).send({ error: 'gameId is required' });
    }
    if (!suspectNpcId || typeof suspectNpcId !== 'string') {
      return reply.status(400).send({ error: 'suspectNpcId is required' });
    }
    if (!motive || typeof motive !== 'string') {
      return reply.status(400).send({ error: 'motive is required' });
    }
    if (!method || typeof method !== 'string') {
      return reply.status(400).send({ error: 'method is required' });
    }
    if (!reasoning || typeof reasoning !== 'string') {
      return reply.status(400).send({ error: 'reasoning is required' });
    }

    const state = getGame(gameId);
    if (!state) {
      return reply.status(404).send({ error: 'Game not found' });
    }

    const caseDef = cases[state.caseId];
    if (!caseDef) {
      return reply.status(500).send({ error: 'Case definition not found' });
    }

    // Check if this is an emergent narrative case
    const isEmergent = caseDef.suspects && caseDef.suspects.length > 0;

    const accusation: Accusation = {
      suspectNpcId,
      motive,
      method,
      reasoning,
    };

    const llm = createLlmProvider();

    if (isEmergent) {
      // Emergent narrative: LLM evaluates coherence
      const result = await evaluateAccusation(accusation, caseDef, state, llm);

      // Calculate dynamic threshold based on game state
      const suspect = caseDef.suspects?.find((s) => s.npcId === suspectNpcId);
      const baseThreshold = caseDef.coherenceThreshold ?? 60;
      const threshold = calculateDynamicThreshold(baseThreshold, state, accusation, suspect);

      if (result.coherent && result.coherenceScore >= threshold) {
        // Generate satisfying resolution
        const resolution = await generateResolution(
          accusation,
          result,
          caseDef,
          state,
          llm
        );

        // Mark case as solved
        dispatch(gameId, { type: 'SOLVE_CASE' });

        return {
          success: true,
          coherenceScore: result.coherenceScore,
          supportingEvidence: result.supportingEvidence,
          resolution,
        };
      } else {
        // Accusation failed — return feedback with threshold info
        return {
          success: false,
          coherenceScore: result.coherenceScore,
          threshold, // Show player what they needed
          contradictions: result.contradictions,
          gaps: result.gaps,
          feedback: generateFailureFeedback(result),
        };
      }
    } else {
      // Fixed solution: simple string matching (legacy mode)
      const suspect = state.npcs.find((n) => n.id === suspectNpcId);
      const solutionMentionsSuspect =
        caseDef.solution?.toLowerCase().includes(suspect?.name.toLowerCase() ?? '') ?? false;

      if (solutionMentionsSuspect) {
        dispatch(gameId, { type: 'SOLVE_CASE' });
        return {
          success: true,
          resolution: caseDef.solution,
        };
      } else {
        return {
          success: false,
          feedback: 'Your accusation doesn\'t match the evidence. Keep investigating.',
        };
      }
    }
  });
}

function generateFailureFeedback(result: {
  contradictions: string[];
  gaps: string[];
}): string {
  const parts: string[] = [];

  if (result.contradictions.length > 0) {
    parts.push(`Your theory contradicts the evidence: ${result.contradictions[0]}`);
  }

  if (result.gaps.length > 0) {
    parts.push(`There are gaps in your reasoning: ${result.gaps[0]}`);
  }

  if (parts.length === 0) {
    parts.push('You need more evidence to support this accusation.');
  }

  return parts.join(' ');
}
