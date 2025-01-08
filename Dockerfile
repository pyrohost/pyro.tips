FROM oven/bun:1 AS base
WORKDIR /app

RUN --mount=type=secret,id=DATABASE_URL \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)"

COPY package.json bun.lockb* ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

RUN bun run build

FROM base AS runner
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/build ./build

ENV NODE_ENV=production
USER bun
EXPOSE 3000

CMD ["bun", "./build/index.js"]