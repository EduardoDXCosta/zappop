# WhatsMenu

WhatsMenu é um SaaS para restaurantes com onboarding da empresa, conexão do WhatsApp via Evolution API e agente de atendimento com IA plugável.

## O que já existe

- Cadastro inicial do restaurante no onboarding
- Conexão da Evolution com gerar QR, renovar QR e desconectar
- Runtime do agente de atendimento com Claude, GPT e Gemini
- Memória de conversa, cardápio sob demanda e criação de pedidos
- Webhook da Evolution integrado ao runtime

## Rodando localmente

1. Instale as dependências:
```bash
npm install
```

2. Copie `.env.local.example` para `.env.local` e preencha as variáveis.

3. Rode o projeto:
```bash
npm run dev
```

4. Abra no navegador:
```text
http://localhost:3000
```

## Variáveis principais

- `DATABASE_URL`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_WEBHOOK_TOKEN`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `APP_DEFAULT_TENANT_SLUG` (opcional)

## Scripts úteis

```bash
npm run dev
npm run build
npm run db:migrate
npx tsc --noEmit
```

## Estrutura atual

- `src/app/page.tsx`: entrada do onboarding
- `src/app/_components/company-onboarding.tsx`: cadastro da empresa
- `src/app/_components/evolution-connect-panel.tsx`: conexão do WhatsApp
- `src/app/api/onboarding/tenant/route.ts`: criação do tenant
- `src/app/api/evolution/...`: gestão da instância Evolution
- `src/app/api/webhook/evolution/route.ts`: webhook do WhatsApp
- `src/lib/agent/*`: runtime do agente
- `src/lib/db/*`: queries e tipos do banco
- `src/lib/evolution/*`: cliente e manager da Evolution

## Próximos passos naturais

- validar o fluxo real com a Evolution
- continuar o onboarding com cardápio inicial
- construir o painel operacional do restaurante
