# ✅ TASKS - WhatsMenu

> **Este arquivo deve ser atualizado sempre que uma tarefa for concluída ou iniciada.**
> **Claude Code deve consultar este arquivo antes de qualquer sessão de desenvolvimento.**

---

## 📌 Status Geral do Projeto
**Fase atual:** FASE 4 e 5 avançando em paralelo + FASE 4.5 (Features de Diferenciação) + Infra Docker/EasyPanel. Dashboard unificado com sidebar, roles, galeria global, edição inline de cardápio, cockpit admin e impersonate. Nova tabela `chats` (session_id-based). Features planejadas: Intervenção Humana, Upsell Automático, Carrinho Abandonado, Indisponibilidade Relâmpago, Modo Teste. Infra: Docker + next.config standalone para deploy EasyPanel. Falta validação E2E, autenticação real e deploy Docker.

---

## ✅ Concluído

- [x] Definição do produto e funcionalidades
- [x] Definição da stack técnica (Next.js + PostgreSQL + Evolution API + IA plugável)
- [x] Definição dos planos (Start, Advanced, Premium)
- [x] Definição do fluxo de onboarding
- [x] Definição do comportamento do agente
- [x] Definição do painel KDS
- [x] Definição do sistema de pagamento e bloqueio
- [x] Definição do sistema de promoções e fidelidade
- [x] Documentação completa do projeto (PROJECT.md)
- [x] Formulário de onboarding testado e validado — dados fake salvos corretamente no PostgreSQL (tenant + horários)
- [x] UI do onboarding refinada — chips de bandeira uniformizados, toggle Aberto/Fechado com visual distinto, botão simplificado
- [x] Migration `0002_roles_and_global_products.sql` — tabela `users` com role (admin/owner), tabela `global_products`, coluna `products.global_product_id`
- [x] Dashboard unificado com sidebar dinâmica por role (ADMIN vs OWNER) — substitui onboarding passo-a-passo
- [x] Sistema de roles: ADMIN (plataforma) e OWNER (restaurante) com session context e guards
- [x] Modo Impersonate: ADMIN pode visualizar o painel como qualquer tenant via cookie seguro
- [x] Galeria Global de Produtos: ADMIN cadastra itens mestre, OWNER importa em massa por nicho com 1 clique
- [x] MenuBuilder refatorado: edição inline de preços (click-to-edit), toggle de disponibilidade, aba Galeria Global com filtro por nicho e "Selecionar Tudo"
- [x] Cockpit Admin com métricas: GMV (dia/mês), Taxa de Conversão IA, Top 5 Restaurantes, Instâncias Offline, Taxa de Falha IA, Tempo Médio de Resposta
- [x] API routes: PATCH produtos (preço/disponibilidade), clone de produto global, CRUD global-products, métricas admin, impersonate
- [x] Página de Restaurantes (Admin): lista todos os tenants com plano, status e botão impersonar
- [x] Página de Configurações (Owner): visualização das informações do restaurante
- [x] Migration `0003_chats_table.sql` — tabela `chats` substituindo `conversations` com session_id, message jsonb e id bigint identity
- [x] Agente atualizado para usar session_id (número do WhatsApp) em vez de customer_id como chave de conversa

---

## 🔄 Em andamento

- [ ] Testar recebimento real de mensagem via Evolution API
- [ ] Validar atendimento completo ponta a ponta com mensagem real, tool calling e envio de resposta
- [ ] Validar conexão real de instância via QR Code na Evolution com tenant existente
- [ ] Refinar onboarding do restaurante com os campos ainda não modelados no schema atual

---

## 📋 A fazer - Por ordem de prioridade

### FASE 1 - Estrutura base
- [x] Criar estrutura de pastas do projeto Next.js *(Next 16 + TS + App Router + Tailwind + ESLint + `src/` + alias `@/*`)*
- [x] Definir e criar schema do PostgreSQL (todas as tabelas) *(`db/migrations/0001_init.sql` - 18 tabelas com índices, constraints e trigger `updated_at`)*
- [x] Configurar conexão Next.js -> PostgreSQL *(`src/lib/db.ts` usando `postgres` (postgres.js), singleton dev-safe)*
- [x] Configurar webhook da Evolution API no Next.js *(`src/app/api/webhook/evolution/route.ts` - POST + GET, autenticação via `EVOLUTION_WEBHOOK_TOKEN`)*
- [x] Migration runner *(`db/migrate.mjs` + script `npm run db:migrate`, tabela `schema_migrations`)*
- [x] `.env.local.example` com todas as variáveis necessárias
- [x] Build de produção passa (`npm run build` OK)
- [ ] Testar recebimento de mensagem WhatsApp *(aguardando validação com ambiente real da Evolution)*

### FASE 2 - Agente de atendimento
- [x] Criar agente base plugável (suporte a Claude, GPT, Gemini) *(`src/lib/ai/*` + `src/lib/agent/*`)*
- [x] Implementar memória do cliente (histórico de conversas) *(`conversations` + `getRecentMessages`)*
- [x] Implementar fluxo de saudação e identificação do cliente *(`upsertCustomer` + prompt contextual)*
- [x] Implementar fluxo de exibição do cardápio (quando solicitado) *(`get_menu`)*
- [x] Implementar fluxo de pedido recorrente *(`lastOrder` + endereço salvo)*
- [x] Implementar fluxo de novo pedido *(`create_order` com validação de itens, endereço e pagamento)*
- [x] Implementar validação de horário de funcionamento *(`tenant_hours` + `tenant_exceptions` + `isOpenNow`)*
- [x] Implementar aviso de restaurante fechado *(`handleIncomingMessage` responde e encerra quando fechado ou em férias)*
- [x] Implementar fluxo de pagamento (PIX, cartão, dinheiro)
- [x] Implementar verificação de bandeira de cartão
- [x] Implementar confirmação de pedido + tempo de espera
- [x] Implementar bloqueio de cliente inadimplente

### FASE 3 - Agente admin
- [ ] Criar agente admin separado (número do dono)
- [ ] Implementar interpretação de comandos naturais
- [ ] Implementar atualização de cardápio via WhatsApp
- [ ] Implementar ativação/desativação de produtos via WhatsApp
- [ ] Implementar atualização de preço via WhatsApp
- [ ] Implementar cardápio do dia via WhatsApp

### FASE 4 - Painel Web
- [x] Criar estrutura completa do painel Next.js *(`/dashboard` com layout + sidebar dinâmica por role)*
- [x] Implementar gestão de cardápio no painel *(MenuBuilder com edição inline de preços e disponibilidade)*
- [ ] Implementar autenticação real do dono (login por telefone/OTP)
- [ ] Implementar KDS (pedidos em tempo real)
- [ ] Implementar mudança de status do pedido no painel
- [ ] Implementar notificação automática ao cliente quando status muda
- [ ] Implementar impressão térmica
- [ ] Implementar impressão normal
- [ ] Implementar gestão de clientes e bloqueio
- [ ] Implementar checklist visual de onboarding

### FASE 4.5 - Features de Diferenciação
- [x] Feature: Botão de Intervenção Humana — dono pausa IA por 30 min e assume conversa pelo painel *(migration 0004, takeover API, conversations page)*
- [x] Feature: Upsell Automático — IA sugere combos/adicionais naturalmente durante o pedido *(regras 13-14 no prompt)*
- [x] Feature: Recuperação de Carrinho Abandonado — mensagem automática após 20 min sem resposta *(migration 0005, cart_sessions, cron endpoint)*
- [x] Feature: Gestão de Indisponibilidade Relâmpago — toggle ON/OFF por produto no painel *(já implementado via MenuBuilder inline)*
- [x] Feature: Modo Teste (Simulador) — chat de teste no painel para o dono testar o robô *(test-runtime, test-chat page)*

### FASE 5 - Onboarding
- [x] Criar página de cadastro do restaurante *(`src/app/page.tsx` + `company-onboarding.tsx`)*
- [x] Validar formulário com dados fake e confirmar persistência no banco *(tenant + tenant_hours salvos OK)*
- [x] Refinar UI do onboarding *(chips uniformes, toggle Aberto/Fechado, botão "Continuar")*
- [x] Criar fluxo de conexão do WhatsApp (QR Code) *(`src/app/_components/evolution-connect-panel.tsx` + rotas `/api/evolution/instances/*`)*
- [x] **[BUG FIX]** Tratar resposta `404 Not Found` da Evolution ao buscar instâncias que ainda não existem como `null`, evitando crash na página de Onboarding.
- [x] **[UI FIX]** Redesign da tela de Conexão: removido lixo técnico (webhooks, perfis, instâncias) para ser amigável ao dono do Restaurante.
- [x] **[BUG FIX]** Polling do frontend apagava QR Code. Componente React refatorado para realizar Functional Update do state e preservar a base64 da imagem.
- [x] **[BUG FIX]** Polling não mudava tela para "Conectado": Corrigido modelo de extração JSON `mapInstance` e URL Root com endpoint limpo. A API V2 da Evolution usa `name` no lugar de `instanceName` silenciosamente.
- [x] Criar interface para Configuração do Cardápio *(`/dashboard/menu` com MenuBuilder refatorado — edição inline, galeria global)*
- [ ] Criar botão de suporte com notificação WhatsApp
- [ ] Criar fluxo de escolha de plano
- [ ] Integrar Asaas (pagamento recorrente)
- [ ] Implementar trial de 7 dias
- [x] Persistir dados iniciais do restaurante *(`src/app/api/onboarding/tenant/route.ts`)*
- [x] Persistir horário de funcionamento inicial *(`replaceTenantHours`)*
- [ ] Modelar e salvar campos ainda fora do schema atual:
  valor mínimo do pedido, e-mail, tempo de entrega dinâmico, frete por bairro/região, área rural e regras operacionais avançadas

### FASE 6 - Promoções e Fidelidade
- [ ] Implementar promoções por horário
- [ ] Implementar promoções por dia
- [ ] Implementar combos
- [ ] Implementar programa de fidelidade
- [ ] Implementar cupons de desconto
- [ ] Implementar disparo ativo para clientes inativos

### FASE 7 - Funcionalidades extras
- [ ] Implementar link de cardápio compartilhável
- [ ] Implementar modo férias / pausa
- [ ] Implementar tempo de espera configurável
- [ ] Implementar confirmação de entrega + solicitação de avaliação
- [ ] Implementar pesquisa de satisfação automática (Premium)
- [ ] Implementar Pixel do Facebook (Premium)
- [ ] Implementar relatório mensal automático no WhatsApp
- [ ] Implementar relatório do trial no 7º dia

### FASE 8 - Integrações adicionais
- [ ] Implementar atendimento no Facebook (Start+)
- [ ] Implementar atendimento no Instagram (Premium)

---

## 🔧 Infraestrutura

- [x] Configurar Docker para deploy no EasyPanel (Dockerfile, docker-compose.yml)
- [x] Configurar next.config.ts com output standalone
- [x] Criar .dockerignore
- [x] Criar docker-entrypoint.sh (migrate + start)
- [x] Criar .env.production.example

---

## 📝 Notas e decisões importantes

| Data | Decisão |
|---|---|
| 10/04/2026 | Stack definida: Next.js + PostgreSQL + Evolution API |
| 10/04/2026 | Sem n8n - tudo desenvolvido em código |
| 10/04/2026 | IA plugável - suporte a Claude, GPT, Gemini |
| 10/04/2026 | Planos: Start R$219,99 / Advanced R$254,99 / Premium R$329,99 |
| 10/04/2026 | Trial 7 dias completo com relatório no último dia |
| 10/04/2026 | Bloqueio de inadimplente manual pelo painel |
| 10/04/2026 | Impressão: aceita térmica e normal |
| 10/04/2026 | Onboarding self-service com checklist |
| 11/04/2026 | Scaffold Next.js 16 concluído dentro de `d:/ProjetosAntigravity/ZapFood` |
| 11/04/2026 | Driver Postgres escolhido: `postgres` (postgres.js) - sem ORM |
| 11/04/2026 | Schema inicial com 18 tabelas aplicando supabase-postgres-best-practices |
| 11/04/2026 | Banco hospedado no EasyPanel |
| 11/04/2026 | FASE 2 do agente de atendimento integrada ao webhook com build de produção validado localmente |
| 11/04/2026 | Tela interna de conexão Evolution implementada com create/connect/logout/status por slug, usando segredos apenas no backend |
| 11/04/2026 | Onboarding inicial do restaurante implementado antes da conexão do WhatsApp |
| 11/04/2026 | Fix onboarding: chips de bandeira com estilo uniforme + toggle Aberto/Fechado no horário com visual rose para fechado |
| 11/04/2026 | Botão de submit simplificado para "Continuar" |
| 11/04/2026 | Teste E2E do formulário: dados fake preenchidos via browser, submetidos e confirmados no banco (tenant a3c70db7 + 6 horários Seg-Sáb 11h-22h) |
| 11/04/2026 | z-index e pointer-events corrigidos no layout principal e painel Evolution |
| 12/04/2026 | Migration 0002: tabela `users` (role admin/owner) + `global_products` + `products.global_product_id` |
| 12/04/2026 | Dashboard unificado substitui onboarding passo-a-passo. Sidebar dinâmica por role. |
| 12/04/2026 | Galeria Global: Admin cadastra itens mestre, Owner importa em massa por nicho |
| 12/04/2026 | Edição inline de preços e disponibilidade no cardápio (sem modais para edições simples) |
| 12/04/2026 | Cockpit Admin: GMV, conversão IA, top restaurantes, instâncias offline, falha IA, tempo resposta |
| 12/04/2026 | Modo Impersonate: Admin visualiza como qualquer tenant via cookie httpOnly |
| 12/04/2026 | Session context em `src/lib/auth/` — prepara para autenticação real futura sem tocar nas pages |
| 12/04/2026 | Migration 0003: tabela `chats` substitui `conversations` — session_id-based para separação por WhatsApp |
| 12/04/2026 | Features de diferenciação: Intervenção Humana, Upsell, Carrinho Abandonado, Indisponibilidade Relâmpago, Modo Teste |
| 12/04/2026 | Infra Docker/EasyPanel: output standalone, Dockerfile multi-stage, docker-compose com PostgreSQL |
