# 🍔 WhatsMenu — Agente de Atendimento WhatsApp para Restaurantes

> **Documento master do projeto. Claude Code deve sempre consultar este arquivo antes de qualquer ação. Não fazer alterações de arquitetura sem aprovação explícita.**

---

## 📌 Visão Geral

App SaaS de atendimento automatizado via WhatsApp para restaurantes, marmitarias e hamburguerias. O cliente conversa naturalmente com um agente de IA que entende o contexto, tem memória dos pedidos anteriores, passa cardápio quando solicitado, recebe pedidos, informa promoções e envia atualizações de status.

---

## 🧱 Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend / Backend | Next.js |
| Banco de dados | PostgreSQL (direto, sem Supabase) |
| WhatsApp | Evolution API |
| IA | Plugável — Claude, GPT, Gemini (configurável por cliente) |
| Pagamentos (restaurante → plataforma) | Asaas |
| Desenvolvimento | Claude Code |

---

## 🏗️ Arquitetura

```
Evolution API
     ↓ webhook
Next.js (backend)
     ↓
PostgreSQL
     ↓
Agente IA (plugável)
     ↓
Resposta → Evolution API → WhatsApp
```

---

## 👤 Tipos de Usuário

### 1. Cliente Final
Conversa com o agente via WhatsApp do restaurante.

### 2. Dono do Restaurante
- Gerencia operação rápida pelo **WhatsApp Admin**
- Gerencia cadastros completos pelo **Painel Web**

### 3. Administrador da Plataforma (você)
- Recebe notificações de suporte no WhatsApp
- Gerencia tenants

---

## 💬 Comportamento do Agente de Atendimento

### Princípios fundamentais
- Conversa **natural como humano** — nunca robótica
- **Nunca envia cardápio sem o cliente pedir**
- Tem **memória do cliente** — sabe nome, histórico de pedidos, endereço
- Oferece pedido recorrente: *"Da última vez você pediu X, vai querer o mesmo?"*
- Quando **fechado**: informa horário de funcionamento e encerra cordialmente
- Quando cliente está **bloqueado**: informa que há uma pendência e pede contato com o restaurante

### Jornada do cliente
1. Cliente manda "oi"
2. Agente cumprimenta pelo nome (se já cadastrado)
3. Pergunta o que deseja
4. Se cliente já tem histórico → oferece repetir último pedido
5. Conversa flui naturalmente até fechar o pedido
6. Agente pergunta forma de pagamento (PIX, cartão, dinheiro)
7. Se cartão → verifica bandeira aceita pelo restaurante
8. Confirma pedido + informa tempo estimado de espera
9. Pedido vai para o painel
10. Conforme status muda no painel → cliente recebe atualização no WhatsApp
11. Pedido entregue → agente manda mensagem de confirmação + solicita avaliação

---

## 🛠️ Agente Admin (WhatsApp do Dono)

Número separado do atendimento. Dono manda mensagens naturais:
- *"Tirar o X-Salada hoje"*
- *"Frango acabou"*
- *"Preço do X-Burguer agora é 32 reais"*
- *"Cardápio do dia: frango grelhado, arroz, feijão, salada"*

O agente interpreta e atualiza o PostgreSQL automaticamente.

**Regra:** WhatsApp Admin → alterações rápidas do dia a dia
**Painel Web** → cadastros completos (produto novo com foto, promoções, configurações)

---

## 📋 Cadastro do Restaurante

```
IDENTIFICAÇÃO
- Nome completo
- CPF
- CNPJ
- Logotipo (URL)

PAGAMENTO
- Aceita cartão? Se sim, quais bandeiras
- Aceita vale alimentação? Se sim, quais
- Faz nota fiscal com CPF?
- Chave PIX

ENDEREÇO (retirada)
- Rua, número, bairro, CEP, cidade, estado
- Latitude / Longitude (fixo, não tempo real)

ENTREGA
- Faz entrega? (boolean)
- Valor do frete
- Entrega em bairros distantes? (boolean)
- Raio de entrega em km
- Bairros atendidos (array)

FUNCIONAMENTO
- Horário de abertura / fechamento
- Pode ter dois turnos (ex: 11h-14h e 18h-22h)
- Dias da semana que abre
- Dias excepcionais (feriados, férias)

WHATSAPP
- Número de atendimento (clientes)
- Número admin (dono)
```

---

## 🗂️ Cardápio

### Tipos
- **Fixo** — hamburguerias, pizzarias. Muda raramente
- **Do dia** — marmitarias. Dono atualiza toda manhã. Some automaticamente no dia seguinte

### Estrutura
- Categorias (ex: Lanches, Bebidas, Combos) com ordenação
- Produtos com nome, descrição, preço, foto, disponibilidade
- Adicionais / complementos por produto (obrigatório ou opcional, limite máximo)

### Cardápio compartilhável
Cada restaurante tem um **link público do cardápio digital** para compartilhar nas redes sociais.

---

## 📦 Pedidos

### Status
`aguardando → aceito → em preparo → saiu para entrega → entregue → cancelado`

### Tipos
- Entrega
- Retirada no local

### Pagamento
- PIX → confirmação automática antes de fechar pedido
- Cartão → verifica bandeira aceita → pagamento na entrega
- Dinheiro → pergunta se precisa de troco, para qual valor

### Bloqueio de inadimplente
- Manual pelo dono no painel
- Cliente bloqueado tenta pedir → agente avisa sobre pendência

---

## 🖥️ Painel Web

### Painel da Cozinha / Caixa (KDS)
- Pedidos chegam em **tempo real**
- Dono clica: Aceitar → Em Preparo → Saiu → Entregue
- Cada mudança de status dispara mensagem automática pro cliente no WhatsApp
- **Impressão**: aceita impressora térmica e impressora normal

### Painel Admin
- Gestão de cardápio (adicionar, editar, ativar/desativar)
- Gestão de clientes (histórico, bloqueio)
- Promoções e cupons
- Relatórios de vendas
- Configurações do restaurante
- Modo férias / pausa

---

## 🎯 Promoções e Fidelidade

- Promoção por horário (ex: "Todo dia das 14h às 17h, X-Burguer por R$20")
- Promoção por dia (ex: "Segunda sem frete")
- Combos (ex: "Lanche + bebida por R$25")
- Fidelidade (ex: "A cada 10 pedidos, ganha 1 grátis")
- Cupons de desconto
- **Disparo ativo** — mensagem automática para clientes inativos há X dias

---

## ⚙️ Funcionalidades Operacionais

- **Tempo de espera** — dono configura no painel, agente informa ao cliente ao confirmar pedido
- **Modo férias / pausa** — dono ativa no painel, agente avisa clientes automaticamente
- **Aviso de fechado** — agente informa horário de funcionamento e encerra
- **Confirmação de entrega** — agente manda mensagem + solicita avaliação
- **Pesquisa de satisfação automática** — após entrega (plano Premium)
- **Pixel do Facebook** — integração para rastreamento de anúncios (plano Premium)

---

## 💰 Planos e Preços

### Start — R$219,99/mês
- Atendimento automático no WhatsApp
- Atendimento no Facebook
- Cardápio digital
- Painel de pedidos

### Advanced — R$254,99/mês
Tudo do Start +
- Programa de fidelidade automático
- Cupons de desconto

### Premium — R$329,99/mês
Tudo do Advanced +
- Atendimento no Instagram
- Pesquisa de satisfação automática
- Tela de pedidos para cozinha (KDS)
- Pixel do Facebook

### Trial
- **7 dias grátis** com acesso completo ao Premium
- No 7º dia → relatório automático enviado ao dono no WhatsApp (pedidos, faturamento, produto mais vendido, horário de pico)
- Após trial sem assinatura → acesso bloqueado mas **dados preservados**
- **Pagamento**: PIX, boleto ou cartão (via Asaas)

---

## 🚀 Onboarding (Self-service)

1. Dono acessa o site, escolhe plano, paga
2. Recebe acesso ao painel
3. Preenche dados do restaurante
4. Conecta número WhatsApp via Evolution API (QR Code)
5. Cadastra cardápio
6. Ativa e começa a receber clientes

### Checklist visual no painel
- ✅ Dados do restaurante preenchidos
- ✅ WhatsApp conectado
- ✅ Cardápio cadastrado
- ⬜ Horário configurado
- ⬜ Forma de pagamento configurada

### Botão de suporte
Se não conseguir conectar o WhatsApp → botão dispara mensagem no WhatsApp do admin da plataforma com dados do cliente → tela exibe "Em breve entraremos em contato"

---

## 📊 Relatórios

- Relatório automático mensal enviado ao dono no WhatsApp
- Relatório do trial no 7º dia
- Dados: total de pedidos, faturamento, produto mais vendido, horário de pico, clientes novos vs recorrentes

---

## 🔒 Regras para o Claude Code

1. **Sempre consultar este arquivo antes de qualquer ação**
2. **Sempre consultar TASKS.md para ver o que foi feito e o que fazer a seguir**
3. **Não fazer alterações de arquitetura sem aprovação explícita**
4. **Não adicionar funcionalidades não listadas aqui sem aprovação**
5. **Não trocar tecnologias da stack sem aprovação**
6. **Sempre atualizar TASKS.md após completar uma tarefa**
7. **Sempre salvar arquivos importantes no Obsidian**
