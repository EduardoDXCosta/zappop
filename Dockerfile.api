# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root workspace manifests first (needed for npm workspaces)
COPY package.json package-lock.json ./

# Copy workspace package manifests so npm ci can resolve all workspaces
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install all deps (including devDeps for tsc)
RUN npm ci --workspace=apps/api --workspace=packages/shared --include-workspace-root

# Copy shared package source and compile it
COPY packages/shared/ ./packages/shared/
RUN npm run build --workspace=packages/shared 2>/dev/null || true

# Copy API source and compile TypeScript
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN npm run build

# ── Stage 2: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy root manifest for workspace resolution
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install only production deps
RUN npm ci --workspace=apps/api --workspace=packages/shared --include-workspace-root --omit=dev

# Copy compiled API output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy shared package (runtime types, if needed at runtime)
COPY --from=builder /app/packages/shared ./packages/shared

# Copy DB migration scripts (runs at startup)
COPY apps/api/db ./apps/api/db

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser && \
    chown -R apiuser:nodejs /app

USER apiuser

WORKDIR /app/apps/api

EXPOSE 3001
ENV PORT=3001
ENV HOST=0.0.0.0

CMD ["sh", "-c", "echo '=== Running migrations ===' && node db/migrate.mjs 2>&1; echo '=== Starting API ===' && exec node dist/server.js"]
