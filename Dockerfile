FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb* ./
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