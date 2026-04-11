# 🤖 PROMPT MASTER — Claude Code — WhatsMenu

> Cole este prompt no início de cada sessão no Claude Code para garantir contexto completo.

---

## INSTRUÇÕES PARA O CLAUDE CODE

Você está desenvolvendo o **WhatsMenu** — um SaaS de atendimento automatizado via WhatsApp para restaurantes, marmitarias e hamburguerias.

### Regras absolutas que você deve seguir SEMPRE:

1. **Antes de qualquer ação**, leia o arquivo `PROJECT.md` — ele contém toda a arquitetura, decisões e funcionalidades do projeto
2. **Antes de qualquer ação**, leia o arquivo `TASKS.md` — ele contém o que já foi feito e o que precisa ser feito
3. **Não altere** a stack tecnológica sem aprovação explícita
4. **Não adicione** funcionalidades não listadas no PROJECT.md sem aprovação
5. **Não refatore** código que está funcionando sem aprovação
6. **Após concluir** qualquer tarefa, atualize o TASKS.md marcando como concluída
7. **Salve** arquivos importantes no Obsidian sempre que solicitado
8. **Sempre pergunte** antes de tomar decisões arquiteturais que não estão documentadas

### Stack do projeto (não alterar):
- **Frontend/Backend:** Next.js
- **Banco de dados:** PostgreSQL direto (sem Supabase, sem ORM pesado)
- **WhatsApp:** Evolution API
- **IA:** Plugável — Claude, GPT, Gemini (configurável por tenant)
- **Pagamentos:** Asaas
- **Desenvolvimento:** Claude Code

### O que é o WhatsMenu:
É um agente de atendimento no WhatsApp que funciona como atendente digital para restaurantes. Cada restaurante é um tenant (cliente do SaaS). O agente conversa naturalmente com os clientes finais, tem memória dos pedidos anteriores, passa cardápio quando solicitado, recebe pedidos, informa promoções e atualiza o status do pedido automaticamente.

### Dois agentes separados:
1. **Agente de atendimento** — responde os clientes finais no WhatsApp do restaurante
2. **Agente admin** — responde o dono do restaurante no WhatsApp admin, interpretando comandos naturais e atualizando o banco de dados

### Comportamento do agente de atendimento:
- Conversa natural como humano — nunca robótica
- Nunca envia cardápio sem o cliente pedir
- Tem memória do cliente (nome, histórico, endereço)
- Oferece pedido recorrente: "Da última vez você pediu X, vai querer o mesmo?"
- Quando fechado: informa horário e encerra
- Quando cliente bloqueado: informa pendência e pede contato com restaurante

### Para mais detalhes completos, leia PROJECT.md e TASKS.md antes de começar.
