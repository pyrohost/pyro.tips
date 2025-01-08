FROM oven/bun:1 AS base
WORKDIR /app

ARG DATABASE_URL
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
ARG DISCORD_CLIENT_SECRET
ARG DISCORD_WEBHOOK_URL
ARG PUBLIC_STRIPE_KEY
ARG SECRET_STRIPE_KEY

# Get all Secrets
RUN --mount=type=secret,id=DATABASE_URL \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)"
RUN --mount=type=secret,id=DISCORD_CLIENT_ID \
    DISCORD_CLIENT_ID="$(cat /run/secrets/DISCORD_CLIENT_ID)"
RUN --mount=type=secret,id=DISCORD_CLIENT_SECRET \
    DISCORD_CLIENT_SECRET="$(cat /run/secrets/DISCORD_CLIENT_SECRET)"
RUN --mount=type=secret,id=DISCORD_WEBHOOK_URL \
    DISCORD_WEBHOOK_URL="$(cat /run/secrets/DISCORD_WEBHOOK_URL)"
RUN --mount=type=secret,id=PUBLIC_STRIPE_KEY \
    PUBLIC_STRIPE_KEY="$(cat /run/secrets/PUBLIC_STRIPE_KEY)"
RUN --mount=type=secret,id=SECRET_STRIPE_KEY \
    SECRET_STRIPE_KEY="$(cat /run/secrets/SECRET_STRIPE_KEY)"
RUN --mount=type=secret,id=WEBHOOK_SIGNING_SECRET \
    WEBHOOK_SIGNING_SECRET="$(cat /run/secrets/WEBHOOK_SIGNING_SECRET)"

ENV DATABASE_URL=${DATABASE_URL}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
ENV DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
ENV DISCORD_WEBHOOK_URL=${DISCORD_WEBHOOK_URL}
ENV PUBLIC_STRIPE_KEY=${PUBLIC_STRIPE_KEY}
ENV SECRET_STRIPE_KEY=${SECRET_STRIPE_KEY}

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