# WhatsMenu - Agente de Atendimento WhatsApp para Restaurantes

> Documento master do projeto. Deve ser consultado antes de qualquer alteração importante de arquitetura ou escopo.

---

## Visão Geral

WhatsMenu é um SaaS de atendimento automatizado via WhatsApp para restaurantes, marmitarias e hamburguerias. O cliente conversa com um agente de IA que entende contexto, lembra pedidos anteriores, consulta cardápio quando solicitado, recebe pedidos e acompanha a operação do restaurante.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend / Backend | Next.js |
| Banco de dados | PostgreSQL direto (sem Supabase) |
| WhatsApp | Evolution API |
| IA | Plugável - Claude, GPT, Gemini |
| Pagamentos da plataforma | Asaas |
| Desenvolvimento | Claude Code |

---

## Arquitetura Atual

```text
Painel / Onboarding Next.js
        ↓
Rotas internas do backend
        ↓
PostgreSQL + Evolution API + provedores de IA
        ↓
Webhook Evolution → runtime do agente → WhatsApp do cliente
```

---

## Tipos de Usuário

### 1. Cliente final
Conversa com o agente via WhatsApp do restaurante.

### 2. Dono do restaurante
- Faz onboarding da empresa
- Conecta o WhatsApp via QR Code
- Vai gerenciar operação pelo painel e pelo WhatsApp admin

### 3. Administrador da plataforma
- Gerencia tenants
- Recebe suporte e acompanha onboarding

---

## Estado Atual do Produto

### Já implementado no código
- Runtime do agente de atendimento com suporte a Claude, GPT e Gemini
- Memória de conversa e último pedido do cliente
- Validação de horário de funcionamento e exceções
- Tool de cardápio (`get_menu`)
- Tool de criação de pedido (`create_order`) com validação de itens, endereço, cartão, PIX e troco
- Webhook da Evolution ligado ao runtime do agente
- Tela de conexão da Evolution com gerar QR, renovar QR e desconectar
- Onboarding inicial do restaurante antes da conexão do WhatsApp
- Persistência inicial do tenant e horários de funcionamento

### Ainda pendente
- Teste ponta a ponta com mensagem real da Evolution
- Painel operacional completo
- Cardápio completo no onboarding
- Regras avançadas de frete, estoque, promoções e pizza
- Fluxo comercial com plano / cobrança / trial

---

## Comportamento do Agente de Atendimento

### Princípios fundamentais
- Conversa natural, curta e humana
- Nunca envia cardápio sem o cliente pedir
- Usa memória do cliente
- Oferece repetir pedido anterior quando fizer sentido
- Respeita horário de funcionamento
- Informa bloqueio de cliente inadimplente
- Não inventa preços ou produtos

### Jornada principal
1. Cliente envia mensagem
2. Sistema identifica tenant pela instância Evolution
3. Cliente é criado/atualizado no banco
4. Histórico recente e último pedido entram no contexto
5. O modelo responde ou chama tools
6. O pedido é criado no sistema quando o fluxo está completo
7. A resposta volta ao WhatsApp pela Evolution API

---

## Onboarding Atual

### Etapa 1 - Cadastro da empresa
Campos já suportados no app:
- Nome completo
- CPF
- CNPJ
- Logotipo por URL
- WhatsApp de atendimento
- WhatsApp do dono
- Endereço de retirada
- CEP
- Cidade e estado
- Entrega ativa ou só retirada
- Valor do frete
- Entrega em bairros distantes
- Lista simples de bairros atendidos
- Tempo de preparo
- Chave PIX
- Aceita cartão + bandeiras
- Aceita vale alimentação + bandeiras
- Nota fiscal com CPF
- Horário de funcionamento por dia da semana

### Etapa 2 - Conexão do WhatsApp
- Garantir ou criar instância na Evolution
- Configurar webhook automaticamente
- Gerar QR Code
- Gerar novo QR Code se expirar
- Desconectar sessão atual
- Exibir estado da conexão

### Campos ainda não modelados no schema atual
- Valor mínimo do pedido
- Melhor e-mail
- Tempo de entrega dinâmico
- Frete por região ou bairro com regras avançadas
- Área rural
- Clonagem de cardápio
- Controle de estoque por item
- Taxa de embalagem
- Regras de pizza e sabores
- Promoções avançadas por janela de tempo

---

## Cardápio

### Tipos previstos
- Cardápio fixo
- Cardápio do dia

### Estrutura prevista
- Categorias
- Produtos
- Descrição e preço
- Disponibilidade
- Adicionais
- Regras específicas por produto

### Estado atual
- Banco e queries básicas já existem
- Consulta ao cardápio pelo agente já existe
- Gestão visual completa do cardápio ainda não foi implementada

---

## Pedidos

### Status
`aguardando -> aceito -> em_preparo -> saiu_entrega -> entregue -> cancelado`

### Tipos
- Delivery
- Pickup

### Estado atual
- Pedido pode ser criado pelo agente
- Itens são validados contra o banco
- Endereço pode ser salvo e reutilizado
- Pagamento é validado antes da criação
- Painel de operação ainda não existe

---

## Painel Web

### Já existe
- Home de onboarding
- Fluxo de cadastro da empresa
- Fluxo de conexão Evolution

### Ainda vai existir
- KDS / cozinha
- Gestão de cardápio
- Gestão de clientes
- Configuração operacional
- Checklist visual de onboarding
- Relatórios

---

## Regras de implementação

1. Consultar este arquivo antes de mudanças estruturais.
2. Consultar `TASKS.md` antes de começar uma nova etapa.
3. Não alterar arquitetura sem aprovação explícita.
4. Não adicionar funcionalidades fora do escopo sem aprovação.
5. Atualizar `TASKS.md` após concluir etapas relevantes.
