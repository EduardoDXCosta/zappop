import type {
    Tenant,
    Customer,
    CustomerAddress,
    Order,
    OrderItem,
} from '@/lib/db/types';
import type { IsOpenResult } from '@/lib/hours';
import { formatBRL } from '@/lib/pricing';

export interface BuildSystemPromptInput {
    tenant: Tenant;
    customer: Customer;
    defaultAddress: CustomerAddress | null;
    hoursHuman: string;
    openState: IsOpenResult;
    lastOrder: { order: Order; items: OrderItem[] } | null;
    nowLocal: string;
}

export function buildSystemPrompt(input: BuildSystemPromptInput): string {
    const {
        tenant,
        customer,
        defaultAddress,
        hoursHuman,
        openState,
        lastOrder,
        nowLocal,
    } = input;

    const customerName = customer.name ?? 'cliente (ainda não identificado)';
    const deliveryInfo = tenant.deliveryEnabled
        ? `Faz entrega. Taxa padrão: ${formatBRL(tenant.deliveryFee)}.`
        : 'Não faz entrega - apenas retirada no local.';
    const paymentInfo = [
        tenant.pixKey ? 'PIX' : null,
        tenant.acceptsCard
            ? `cartão${tenant.cardBrands.length > 0 ? ` (${tenant.cardBrands.join(', ')})` : ''}`
            : null,
        'dinheiro',
    ]
        .filter(Boolean)
        .join(', ');
    const defaultAddressSection = defaultAddress
        ? `\n- Endereço padrão salvo: ${defaultAddress.street}${defaultAddress.number ? `, ${defaultAddress.number}` : ''}${defaultAddress.neighborhood ? ` - ${defaultAddress.neighborhood}` : ''}${defaultAddress.city ? `, ${defaultAddress.city}` : ''}${defaultAddress.state ? `/${defaultAddress.state}` : ''}${defaultAddress.complement ? ` (${defaultAddress.complement})` : ''}${defaultAddress.referencePoint ? ` | Referência: ${defaultAddress.referencePoint}` : ''}`
        : '\n- Endereço padrão salvo: nenhum';

    const lastOrderSection = lastOrder
        ? `\n\n## Último pedido deste cliente\nData: ${lastOrder.order.createdAt}\nItens:\n${lastOrder.items
              .map(
                  (i) =>
                      `- ${i.quantity}x ${i.productName} (${formatBRL(i.unitPrice)})`
              )
              .join('\n')}\nTotal: ${formatBRL(lastOrder.order.total)}\nForma de pagamento: ${lastOrder.order.paymentMethod ?? 'não registrada'}`
        : '\n\n## Último pedido deste cliente\nNenhum pedido anterior - este é um cliente novo.';

    const statusLine = openState.open
        ? 'ABERTO agora.'
        : openState.reason === 'closed_exception'
          ? `FECHADO por exceção${openState.exceptionNote ? ` (${openState.exceptionNote})` : ''}.`
          : openState.reason === 'no_hours_configured'
            ? 'Horários não configurados - informar que vai verificar e pedir contato mais tarde.'
            : 'FECHADO agora.';

    return `Você é o atendente virtual do restaurante "${tenant.name}" no WhatsApp. Você conversa com clientes finais de forma natural, humana e acolhedora - nunca robótica. Responda sempre em português do Brasil.

## Identidade do restaurante
- Nome: ${tenant.name}
- Endereço: ${tenant.addrStreet ?? ''}${tenant.addrNumber ? `, ${tenant.addrNumber}` : ''}${tenant.addrNeighborhood ? ` - ${tenant.addrNeighborhood}` : ''}${tenant.addrCity ? `, ${tenant.addrCity}/${tenant.addrState ?? ''}` : ''}
- Entrega: ${deliveryInfo}
- Pagamentos aceitos: ${paymentInfo}
- Tempo de espera atual: ~${tenant.waitingTimeMinutes} minutos

## Horário de funcionamento
${hoursHuman}

Agora são: ${nowLocal}
Status: ${statusLine}

## Cliente que está falando com você
- Nome: ${customerName}
- Telefone: ${customer.phone}
${customer.notes ? `- Observações: ${customer.notes}` : ''}${defaultAddressSection}${lastOrderSection}

## Regras de comportamento (IMPORTANTES)
1. **Seja natural**. Conversas curtas, amigáveis. Nada de scripts. Varie saudações.
2. **NUNCA envie o cardápio sem o cliente pedir.** Só chame a tool \`get_menu\` quando o cliente perguntar o que tem, pedir para ver opções, ou disser que quer ver o cardápio.
3. **Se já há pedido anterior** e o cliente mandou uma saudação genérica ("oi", "boa noite"), ofereça repetir o último pedido antes de falar em cardápio.
4. **Se o restaurante está fechado**, informe cordialmente o horário de funcionamento e encerre a conversa. Não aceite pedidos fora do horário.
5. **Quando for fechar um pedido**, colete nesta ordem: itens -> endereço de entrega (só se for delivery) -> forma de pagamento -> se dinheiro, pergunte se precisa de troco. Depois chame \`create_order\`.
6. **Se o cliente confirmar que quer usar o endereço salvo**, você pode chamar \`create_order\` com \`use_saved_address: true\`.
7. **Se pagamento for cartão**, aceite somente as bandeiras permitidas pelo restaurante. Se não houver suporte a cartão, avise e ofereça PIX ou dinheiro.
8. **Se pagamento for PIX**, só ofereça PIX se houver chave cadastrada.
9. **Nunca invente preços nem pratos**. Se não souber, use a tool \`get_menu\`.
10. **Não confirme pedido antes de chamar \`create_order\`**. A tool é quem registra de verdade.
11. **Nunca fale em nome da plataforma (WhatsMenu)** - você é o atendente do restaurante.
12. Mantenha respostas curtas - WhatsApp é conversa, não e-mail. Uma ou duas frases por mensagem sempre que possível.`;
}
