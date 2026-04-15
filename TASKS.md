# ✅ TASKS - ZapPop

> **Este arquivo deve ser atualizado sempre que uma tarefa for concluída ou iniciada.**

---

## 📌 Status Geral do Projeto
**Fase atual:** Deploy EasyPanel em andamento. Autenticação real implementada (login/setup com senha). Galeria global com 340+ produtos em 20 categorias. Features de diferenciação completas. Falta: validação E2E com Evolution, KDS, integração Asaas.

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
- [x] Formulário de onboarding testado e validado — dados fake salvos corretamente no PostgreSQL
- [x] UI do onboarding refinada — chips de bandeira uniformizados, toggle Aberto/Fechado com visual distinto
- [x] Migration 0002: tabela `users` com role (admin/owner), tabela `global_products`, coluna `products.global_product_id`
- [x] Dashboard unificado com sidebar dinâmica por role (ADMIN vs OWNER)
- [x] Sistema de roles: ADMIN (plataforma) e OWNER (restaurante) com session context e guards
- [x] Modo Impersonate: ADMIN pode visualizar o painel como qualquer tenant via cookie seguro
- [x] Galeria Global de Produtos: ADMIN cadastra itens mestre, OWNER importa em massa por nicho com 1 clique
- [x] MenuBuilder refatorado: edição inline de preços (click-to-edit), toggle de disponibilidade, aba Galeria Global
- [x] Cockpit Admin com métricas: GMV, Taxa de Conversão IA, Top 5 Restaurantes, Instâncias Offline, Falha IA, Tempo Resposta
- [x] API routes: PATCH produtos, clone de produto global, CRUD global-products, métricas admin, impersonate
- [x] Página de Restaurantes (Admin): lista todos os tenants com plano, status e botão impersonar
- [x] Página de Configurações (Owner): visualização das informações do restaurante
- [x] Migration 0003: tabela `chats` substituindo `conversations` com session_id, message jsonb e id bigint identity
- [x] Agente atualizado para usar session_id (número do WhatsApp) em vez de customer_id como chave de conversa
- [x] Migration 0004: tabela `human_takeovers` — intervenção humana com pause de 30 min
- [x] Feature: Botão de Intervenção Humana — dono pausa IA por 30 min e assume conversa pelo painel
- [x] Feature: Upsell Automático — regras 13-14 no prompt do agente
- [x] Migration 0005: tabela `cart_sessions` — recuperação de carrinho abandonado
- [x] Feature: Recuperação de Carrinho Abandonado — mensagem automática após 20 min sem resposta
- [x] Feature: Gestão de Indisponibilidade Relâmpago — toggle ON/OFF por produto no painel
- [x] Feature: Modo Teste (Simulador) — chat de teste no painel para o dono testar o robô
- [x] Infra Docker/EasyPanel: Dockerfile multi-stage, docker-compose, .dockerignore, entrypoint
- [x] next.config.ts com output standalone para deploy Docker
- [x] db.ts lazy-load para prevenir erros de DATABASE_URL durante build
- [x] dynamic = 'force-dynamic' nas páginas que acessam DB
- [x] Migration 0006: autenticação real — password_hash e session_tokens no banco
- [x] Sistema de login com telefone + senha (cookie httpOnly, scrypt hashing)
- [x] Página /login com dark theme e máscara de telefone
- [x] Página /setup para cadastro do primeiro administrador
- [x] API /api/setup-admin — cria admin e loga automaticamente (só funciona se não houver admin)
- [x] Dashboard protegido — redireciona para /login se não autenticado
- [x] Botão de logout no sidebar
- [x] Fluxo de rotas: / → /setup (sem admin) → /login (sem login) → /dashboard (logado)
- [x] Página /onboarding separada para cadastro de restaurante (link no login)
- [x] Migration 0007: seed de 140+ produtos de hamburgueria na galeria global
- [x] Migration 0008: seed de 200+ produtos de pizzaria, açaí, japonesa, marmita, padaria, crepes, salgados, doces, drinks, espetinhos, fitness, combos
- [x] Galeria global com 340+ produtos em 20 categorias

---

## 🔄 Em andamento

- [ ] Deploy no EasyPanel — build passando, container subindo
- [ ] Testar recebimento real de mensagem via Evolution API
- [ ] Validar atendimento completo ponta a ponta com mensagem real, tool calling e envio de resposta
- [ ] Validar conexão real de instância via QR Code na Evolution com tenant existente

---

## 📋 A fazer - Por ordem de prioridade

### FASE 1 - Estrutura base
- [x] Criar estrutura de pastas do projeto Next.js
- [x] Definir e criar schema do PostgreSQL (18 tabelas)
- [x] Configurar conexão Next.js -> PostgreSQL
- [x] Configurar webhook da Evolution API
- [x] Migration runner
- [x] `.env.local.example` com todas as variáveis
- [x] Build de produção passa
- [ ] Testar recebimento de mensagem WhatsApp

### FASE 2 - Agente de atendimento
- [x] Criar agente base plugável (Claude, GPT, Gemini)
- [x] Implementar memória do cliente (histórico de conversas via chats)
- [x] Implementar fluxo de saudação e identificação do cliente
- [x] Implementar fluxo de exibição do cardápio
- [x] Implementar fluxo de pedido recorrente
- [x] Implementar fluxo de novo pedido
- [x] Implementar validação de horário de funcionamento
- [x] Implementar aviso de restaurante fechado
- [x] Implementar fluxo de pagamento (PIX, cartão, dinheiro)
- [x] Implementar verificação de bandeira de cartão
- [x] Implementar confirmação de pedido + tempo de espera
- [x] Implementar bloqueio de cliente inadimplente
- [x] Implementar upsell automático (regras 13-14 no prompt)
- [x] Implementar recuperação de carrinho abandonado (cron 20 min)

### FASE 3 - Agente admin
- [ ] Criar agente admin separado (número do dono)
- [ ] Implementar interpretação de comandos naturais
- [ ] Implementar atualização de cardápio via WhatsApp
- [ ] Implementar ativação/desativação de produtos via WhatsApp
- [ ] Implementar atualização de preço via WhatsApp
- [ ] Implementar cardápio do dia via WhatsApp

### FASE 4 - Painel Web
- [x] Criar estrutura completa do painel Next.js
- [x] Implementar gestão de cardápio no painel (MenuBuilder)
- [x] Implementar autenticação real (login por telefone + senha)
- [x] Implementar página de setup do primeiro admin
- [ ] Implementar KDS (pedidos em tempo real)
- [ ] Implementar mudança de status do pedido no painel
- [ ] Implementar notificação automática ao cliente quando status muda
- [ ] Implementar impressão térmica
- [ ] Implementar impressão normal
- [ ] Implementar gestão de clientes e bloqueio
- [ ] Implementar checklist visual de onboarding

### FASE 4.5 - Features de Diferenciação
- [x] Feature: Botão de Intervenção Humana
- [x] Feature: Upsell Automático
- [x] Feature: Recuperação de Carrinho Abandonado
- [x] Feature: Gestão de Indisponibilidade Relâmpago
- [x] Feature: Modo Teste (Simulador)

### FASE 5 - Onboarding
- [x] Criar página de cadastro do restaurante
- [x] Validar formulário com dados fake e confirmar persistência no banco
- [x] Refinar UI do onboarding
- [x] Criar fluxo de conexão do WhatsApp (QR Code)
- [x] Criar interface para Configuração do Cardápio
- [x] Persistir dados iniciais do restaurante
- [x] Persistir horário de funcionamento inicial
- [x] Página /onboarding separada do fluxo de login
- [ ] Criar botão de suporte com notificação WhatsApp
- [ ] Criar fluxo de escolha de plano
- [ ] Integrar Asaas (pagamento recorrente)
- [ ] Implementar trial de 7 dias
- [ ] Modelar e salvar campos ainda fora do schema atual

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
- [x] DATABASE_URL como build-arg no Dockerfile
- [x] Remover serviço db do docker-compose (PostgreSQL gerenciado pelo EasyPanel)
- [ ] Validar deploy completo no EasyPanel (container estável)

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
| 11/04/2026 | Scaffold Next.js 16 concluído |
| 11/04/2026 | Driver Postgres escolhido: `postgres` (postgres.js) - sem ORM |
| 11/04/2026 | Schema inicial com 18 tabelas aplicando supabase-postgres-best-practices |
| 11/04/2026 | Banco hospedado no EasyPanel |
| 11/04/2026 | FASE 2 do agente de atendimento integrada ao webhook |
| 11/04/2026 | Tela interna de conexão Evolution com segredos apenas no backend |
| 12/04/2026 | Migration 0002: tabela `users` + `global_products` |
| 12/04/2026 | Dashboard unificado com sidebar dinâmica por role |
| 12/04/2026 | Galeria Global: Admin cadastra itens mestre, Owner importa em massa |
| 12/04/2026 | Cockpit Admin: GMV, conversão IA, top restaurantes |
| 12/04/2026 | Modo Impersonate: Admin visualiza como qualquer tenant |
| 12/04/2026 | Migration 0003: tabela `chats` substitui `conversations` — session_id-based |
| 12/04/2026 | Features de diferenciação implementadas em paralelo via agentes |
| 12/04/2026 | Infra Docker/EasyPanel: output standalone, Dockerfile multi-stage |
| 14/04/2026 | Autenticação real: login por telefone + senha, scrypt hashing, session_tokens |
| 14/04/2026 | Página /setup para primeiro admin — só funciona se banco não tem admin |
| 14/04/2026 | Página /onboarding separada do /login para cadastro de restaurante |
| 14/04/2026 | Galeria global com 340+ produtos em 20 categorias (hamburgueria, pizza, açaí, japonesa, marmita, padaria, crepes, salgados, doces, drinks, fitness, etc.) |
| 14/04/2026 | Deploy EasyPanel: build passando, container subindo — ajustes de .dockerignore e force-dynamic |
