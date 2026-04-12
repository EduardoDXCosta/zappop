# Planejamento: Configuração de Cardápio

## Overview
Criação da tela de gerenciamento visual de cardápios (Categorias, Produtos e Adicionais) que será apresentada no fluxo de Onboarding, permitindo ao dono do restaurante um setup rápido pós-conexão do WhatsApp.

## Project Type
WEB

## Success Criteria
- O restaurante consegue criar 1 Categoria.
- O restaurante consegue cadastrar 1 ou mais Produtos vinculados à categoria criada.
- Os produtos e categorias são salvos corretamente no PostgreSQL sob o `tenant_id` atual (identificado via cookie/sessão do onboarding).
- A tela deve ser construída nos padrões visuais do *Frontend Specialist*, utilizando Tailwind e interações limpas, focando na velocidade de cadastro em lote.
- O clique em "Continuar" deve avançar para a tela de Planos.

## Tech Stack
- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: Rotas API no Next.js (Server Actions ou Route Handlers) mapeando inserções diretas no banco `postgres`.
- Database: Tabelas existentes (`categories`, `products`, `product_addons`).

## File Structure
- `src/app/onboarding/menu/page.tsx` (Página principal do form de cardápio)
- `src/app/_components/menu-builder.tsx` (Componente visual interativo)
- `src/app/api/menu/categories/route.ts` (API POST/GET de categorias)
- `src/app/api/menu/products/route.ts` (API POST/GET de produtos em lote)

## Task Breakdown
1. **Criar estrutura de Rotas da API [Backend Specialist]**
   - *INPUT*: Schemas do Postgres (`categories`, `products`).
   - *OUTPUT*: Rotas `GET/POST` em `/api/menu/*`.
   - *VERIFY*: Testar criação de 1 categoria e 1 produto via script de testes ou cURL chamando a API local.

2. **Montar Componente Visual Base `menu-builder.tsx` [Frontend Specialist]**
   - *INPUT*: Regras do `.agent/agents/frontend-specialist.md`.
   - *OUTPUT*: Interface limpa listando "Categorias" à esquerda/topo e "Produtos" em lista no centro. Sem "purple/violet", seguindo UI premium do projeto.
   - *VERIFY*: Confirmar que input de texto tem labels claros, contrastes apropriados, touch-targets grandes, e UX amigável orientada à conversão e preenchimento veloz.

3. **Integrar Formulário -> Banco e Testar Completo [Orchestrator]**
   - *INPUT*: `menu-builder.tsx` e APIs criadas.
   - *OUTPUT*: Criação de registros com sucesso, visualizados dinamicamente na tela sem recarregar a página (React States ou server actions com revalidate).
   - *VERIFY*: Criar Categoria "Pizzas", Produto "Mussarela", ver aparecer automaticamente.

## Phase X: Verification
- [ ] Lint: `npm run lint` OK
- [ ] UI Rules: Checar cores e templates banidos.
- [ ] Integração: Salva no BD PostgreSQL local sem erros de FK (Foreign Key).
- [ ] Data: Atualizar o arquivo TASKS.md e criar relatórios finais.
