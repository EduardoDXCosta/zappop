# ✅ TASKS - WhatsMenu

> **Este arquivo deve ser atualizado sempre que uma tarefa for concluída ou iniciada.**
> **Claude Code deve consultar este arquivo antes de qualquer sessão de desenvolvimento.**

---

## 📌 Status Geral do Projeto
**Fase atual:** FASE 5 em andamento - onboarding do restaurante e conexão da Evolution já existem, faltando validação real e continuação do cardápio/painel.

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
- [ ] Criar estrutura completa do painel Next.js
- [ ] Implementar autenticação do dono
- [ ] Implementar KDS (pedidos em tempo real)
- [ ] Implementar mudança de status do pedido no painel
- [ ] Implementar notificação automática ao cliente quando status muda
- [ ] Implementar impressão térmica
- [ ] Implementar impressão normal
- [ ] Implementar gestão de cardápio no painel
- [ ] Implementar gestão de clientes e bloqueio
- [ ] Implementar checklist visual de onboarding

### FASE 5 - Onboarding
- [x] Criar página de cadastro do restaurante *(`src/app/page.tsx` + `company-onboarding.tsx`)*
- [ ] Criar fluxo de escolha de plano
- [ ] Integrar Asaas (pagamento recorrente)
- [x] Criar fluxo de conexão do WhatsApp (QR Code) *(`src/app/_components/evolution-connect-panel.tsx` + rotas `/api/evolution/instances/*`)*
- [ ] Criar botão de suporte com notificação WhatsApp
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
