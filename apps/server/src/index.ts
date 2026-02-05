import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { gameRoutes } from './routes/game';
import { chatRoutes } from './routes/chat';
import { accusationRoutes } from './routes/accusation';
import { imageRoutes } from './routes/image';

const app = Fastify({ logger: true });

async function start() {
  // CORS: use ALLOWED_ORIGINS env var in production, allow all in development
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? true;
  await app.register(cors, { origin: allowedOrigins });
  await app.register(healthRoutes);
  await app.register(gameRoutes);
  await app.register(chatRoutes);
  await app.register(accusationRoutes);
  await app.register(imageRoutes);

  const port = parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen({ port, host });
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

export { app };
