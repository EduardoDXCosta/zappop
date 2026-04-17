# Migração para Monorepo Turborepo

## Goal
Migrar o WhatsMenu de monolito Next.js para monorepo Turborepo com backend Fastify (API REST) e frontend Next.js separados, preparando para escalar.

> **Status:** ⏳ Aguardando aprovação do usuário

---

## Arquitetura Atual → Nova

```
ATUAL (monolito):
  Next.js → API Routes + Server Components → PostgreSQL direto

NOVO (monorepo):
  apps/web (Next.js)  →  HTTP REST  →  apps/api (Fastify)  →  PostgreSQL
  packages/shared (tipos TypeScript compartilhados)
```

---

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Backend framework | **Fastify** | TypeScript nativo, 2x mais rápido que Express, plugin system |
| Monorepo tool | **Turborepo** | Cache, builds coordenados, workspace nativo |
| Auth no backend | **Cookie httpOnly via Set-Cookie** | Mantém segurança, frontend faz proxy |
| Porta backend | **3001** | Frontend mantém 3000 |
| Porta frontend | **3000** | Padrão Next.js |
| Package shared | **@whatsmenu/shared** | Tipos TypeScript compartilhados |

---

## Tasks

### Fase 1: Scaffold do Monorepo
- [x] Criar `package.json` root com workspaces
- [x] Criar `turbo.json` com pipeline build/dev
- [x] Criar `packages/shared/` com types.ts extraído de `src/lib/db/types.ts`
- [x] Criar `apps/web/` com Next.js (mover frontend)
- [x] Criar `apps/api/` com Fastify (base)
→ Verify: `npm install` no root funciona, workspaces reconhecidos

### Fase 2: Backend Fastify
- [x] Criar `apps/api/src/server.ts` (entry point Fastify)
- [x] Criar plugins: `auth.ts`, `cors.ts`, `error-handler.ts`
- [x] Mover `src/lib/db.ts` → `apps/api/src/db/connection.ts`
- [x] Mover `src/lib/db/queries/*` (14 files) → `apps/api/src/db/queries/`
- [x] Mover `src/lib/agent/*` → `apps/api/src/lib/agent/`
- [x] Mover `src/lib/ai/*` → `apps/api/src/lib/ai/`
- [x] Mover `src/lib/evolution/*` → `apps/api/src/lib/evolution/`
- [x] Mover `src/lib/hours.ts`, `phone.ts`, `pricing.ts` → `apps/api/src/lib/`
- [x] Converter 12 grupos de API Routes para rotas Fastify
- [x] Reescrever auth sem `cookies()` do Next.js (Bearer token + cookie)
- [x] Mover `db/migrations/`, `migrate.mjs`, `check.mjs` → `apps/api/db/`
→ Verify: `npm run dev` no api sobe na porta 3001, `curl localhost:3001/auth/me` retorna 401

### Fase 3: Frontend Next.js (sem backend)
- [x] Criar `apps/web/src/lib/api-client.ts` (fetch wrapper)
- [ ] Remover `src/app/api/` inteiro do Next.js (pendente de remoção)
- [ ] Remover `src/lib/db*`, `agent/`, `ai/`, `evolution/`, `auth/` do Next.js (pendente de remoção)
- [x] Ajustar `page.tsx` para usar api-client
- [x] Ajustar `dashboard/layout.tsx` para buscar sessão via API
- [x] Ajustar `dashboard/page.tsx` para buscar dados via API
- [x] Ajustar todos os componentes que faziam `fetch('/api/...')`
→ Verify: `npm run dev` no web sobe na porta 3000, login funciona, dashboard carrega

### Fase 4: Docker e Infra
- [ ] Criar `Dockerfile.api`
- [ ] Criar `Dockerfile.web`
- [ ] Atualizar `docker-compose.yml` com 2 serviços
- [ ] Separar `.env` (backend) e `.env.local` (frontend)
→ Verify: `docker compose build` passa, ambos containers sobem

### Fase 5: Verificação Final
- [ ] `npm run build` no root sem erros
- [ ] `npx tsc --noEmit` em cada workspace
- [ ] Fluxo completo: login → dashboard → menu → test-chat
- [ ] Webhook Evolution apontando para api:3001
→ Verify: Toda a aplicação funcional como antes

---

## Mapeamento de Arquivos

| Origem | Destino | Ação |
|---|---|---|
| `src/lib/db/types.ts` | `packages/shared/src/types.ts` | MOVE |
| `src/lib/db.ts` | `apps/api/src/db/connection.ts` | MOVE |
| `src/lib/db/queries/*` (14) | `apps/api/src/db/queries/*` | MOVE |
| `src/lib/agent/*` (5) | `apps/api/src/lib/agent/*` | MOVE |
| `src/lib/ai/*` (5) | `apps/api/src/lib/ai/*` | MOVE |
| `src/lib/evolution/*` (5) | `apps/api/src/lib/evolution/*` | MOVE |
| `src/lib/auth/*` (4) | `apps/api/src/plugins/auth.ts` | REWRITE |
| `src/lib/hours.ts` | `apps/api/src/lib/hours.ts` | MOVE |
| `src/lib/phone.ts` | `apps/api/src/lib/phone.ts` | MOVE |
| `src/lib/pricing.ts` | `apps/api/src/lib/pricing.ts` | MOVE |
| `src/app/api/**/*` (12 groups) | `apps/api/src/routes/*` | REWRITE |
| `src/app/**/*.tsx` (pages) | `apps/web/src/app/**/*.tsx` | MODIFY |
| `src/app/_components/*` | `apps/web/src/app/_components/*` | MOVE |
| `db/*` | `apps/api/db/*` | MOVE |
| `Dockerfile` | `Dockerfile.api` + `Dockerfile.web` | SPLIT |
| `docker-compose.yml` | 2 serviços | MODIFY |
| `package.json` | Root workspace | REWRITE |

---

## Variáveis de Ambiente

### apps/api/.env
```
DATABASE_URL=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_WEBHOOK_TOKEN=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_API_KEY=
CRON_SECRET=
ASAAS_API_KEY=
ASAAS_ENV=sandbox
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### apps/web/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Progresso

| Data | Alteração |
|---|---|
| 17/04/2026 | Plano criado e salvo em `monorepo-migration.md` |
| 17/04/2026 | **Fase 1:** Workspaces e Turborepo configurados. Pacote shared (`@whatsmenu/shared`) construído. |
| 17/04/2026 | **Fase 2:** Backend API em Fastify inicializado. Plugins configurados. Lógicas e conexões de BD migradas. Stubs de rotas convertidos. Resoluções de encoding utf-8 feitas. |
| 17/04/2026 | **Fase 3:** Instalação bem sucedida do npm. Componentes web ajustados para consumir API externa (`fetch(\`${API_URL}/...\`)`). Helpers adicionados. |

---

## Done When
- [ ] Monorepo funcional com `apps/web`, `apps/api`, `packages/shared`
- [ ] Backend Fastify respondendo em :3001 com todas as rotas
- [ ] Frontend Next.js consumindo API REST sem acesso direto ao DB
- [ ] Docker compose buildando 2 containers separados
- [ ] Login → Dashboard → Menu → Test Chat funcionando E2E
