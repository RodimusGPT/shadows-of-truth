import { FastifyInstance } from 'fastify';
import { createGame, getGame, listGames } from '../game-state';
import { missingHeiress } from '../data/cases/missing-heiress';
import { CaseDefinition } from '@shadows/shared';

const cases: Record<string, CaseDefinition> = {
  'missing-heiress': missingHeiress,
};

export async function gameRoutes(app: FastifyInstance) {
  app.post<{ Body: { caseId: string } }>('/api/game/new', async (request, reply) => {
    const { caseId } = request.body;
    const caseDef = cases[caseId];
    if (!caseDef) {
      return reply.status(400).send({ error: `Unknown case: ${caseId}` });
    }
    const state = createGame(caseDef);
    return { gameId: state.gameId, state };
  });

  app.get<{ Params: { gameId: string } }>('/api/game/:gameId', async (request, reply) => {
    const state = getGame(request.params.gameId);
    if (!state) {
      return reply.status(404).send({ error: 'Game not found' });
    }
    return { state };
  });

  app.get('/api/game', async () => {
    return { games: listGames().map((g) => ({ gameId: g.gameId, caseId: g.caseId, turn: g.turn })) };
  });

  app.get('/api/cases', async () => {
    return {
      cases: Object.values(cases).map((c) => ({
        id: c.id,
        title: c.title,
        synopsis: c.synopsis,
      })),
    };
  });
}
