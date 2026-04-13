FROM node:22-alpine AS builder
WORKDIR /app
ARG DATABASE_URL=postgres://placeholder:5432/placeholder
ENV DATABASE_URL=$DATABASE_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db

RUN npm install postgres --no-save 2>/dev/null || true

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "echo '=== Running migrations ===' && node db/migrate.mjs 2>&1; echo '=== Starting server ===' && exec node server.js"]
