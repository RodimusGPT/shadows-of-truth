FROM node:20-slim AS base
RUN npm install -g pnpm@10

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY apps/server/ apps/server/

RUN pnpm --filter @shadows/shared build
RUN pnpm --filter @shadows/server build

FROM node:20-slim AS runner
RUN npm install -g pnpm@10

WORKDIR /app
COPY --from=base /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json /app/turbo.json ./
COPY --from=base /app/packages/shared/package.json /app/packages/shared/dist/ packages/shared/
COPY --from=base /app/apps/server/package.json apps/server/
COPY --from=base /app/apps/server/dist/ apps/server/dist/

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]
