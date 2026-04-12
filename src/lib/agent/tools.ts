import type { AIToolDefinition, AIToolCall } from '@/lib/ai';
import type { Tenant, Customer, CustomerAddress } from '@/lib/db/types';
import {
    getCategoriesByTenant,
    getProductsByTenant,
    getDailyMenu,
    getProductsByIds,
    createOrder,
    saveDefaultCustomerAddress,
} from '@/lib/db/queries';
import { formatBRL, calculatePricing } from '@/lib/pricing';

export const agentTools: AIToolDefinition[] = [
    {
        name: 'get_menu',
        description:
            'Retorna o cardápio do restaurante (categorias e produtos disponíveis com preços). Use APENAS quando o cliente pedir para ver o cardápio ou perguntar o que tem.',
        inputSchema: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description:
                        'Nome da categoria para filtrar (opcional). Deixe em branco para trazer tudo.',
                },
            },
            required: [],
        },
    },
    {
        name: 'create_order',
        description:
            'Registra um pedido no sistema. Chame APENAS quando já tiver: itens confirmados, endereço (se delivery), forma de pagamento, e (se dinheiro) o troco. Não confirme o pedido ao cliente antes de chamar esta tool.',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['delivery', 'pickup'],
                    description: 'Entrega ou retirada no local.',
                },
                use_saved_address: {
                    type: 'boolean',
                    description:
                        'Use true somente se o cliente confirmou que quer usar o endereço salvo.',
                },
                address: {
                    type: 'object',
                    description:
                        'Endereço de entrega. Obrigatório para delivery quando não usar o endereço salvo.',
                    properties: {
                        label: { type: 'string' },
                        street: { type: 'string' },
                        number: { type: 'string' },
                        complement: { type: 'string' },
                        neighborhood: { type: 'string' },
                        zip: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        reference_point: { type: 'string' },
                    },
                    required: ['street'],
                },
                items: {
                    type: 'array',
                    description: 'Lista de itens do pedido.',
                    items: {
                        type: 'object',
                        properties: {
                            product_id: { type: 'string' },
                            product_name: { type: 'string' },
                            quantity: { type: 'integer', minimum: 1 },
                            unit_price: { type: 'number', minimum: 0 },
                            notes: { type: 'string' },
                        },
                        required: [
                            'product_id',
                            'product_name',
                            'quantity',
                            'unit_price',
                        ],
                    },
                },
                payment_method: {
                    type: 'string',
                    enum: ['pix', 'card', 'cash'],
                },
                card_brand: {
                    type: 'string',
                    description:
                        'Bandeira do cartão (só quando payment_method = card).',
                },
                change_for: {
                    type: 'number',
                    description:
                        'Valor para troco (só quando payment_method = cash e cliente precisa de troco).',
                },
                notes: {
                    type: 'string',
                    description: 'Observações gerais do pedido.',
                },
            },
            required: ['type', 'items', 'payment_method'],
        },
    },
];

export interface ToolExecContext {
    tenant: Tenant;
    customer: Customer;
    defaultAddress: CustomerAddress | null;
    sessionId: string;
}

export interface ToolResult {
    toolCallId: string;
    name: string;
    content: string;
}

export async function executeToolCall(
    call: AIToolCall,
    ctx: ToolExecContext
): Promise<ToolResult> {
    try {
        if (call.name === 'get_menu') {
            const content = await runGetMenu(ctx.tenant, call.input);
            return { toolCallId: call.id, name: call.name, content };
        }
        if (call.name === 'create_order') {
            const content = await runCreateOrder(ctx, call.input);
            return { toolCallId: call.id, name: call.name, content };
        }
        return {
            toolCallId: call.id,
            name: call.name,
            content: JSON.stringify({ error: `Unknown tool: ${call.name}` }),
        };
    } catch (err) {
        return {
            toolCallId: call.id,
            name: call.name,
            content: JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
            }),
        };
    }
}

async function runGetMenu(
    tenant: Tenant,
    input: Record<string, unknown>
): Promise<string> {
    const categoryFilter =
        typeof input.category === 'string' ? input.category.trim() : '';

    const categories = await getCategoriesByTenant(tenant.id);
    const products = await getProductsByTenant(tenant.id, {
        availableOnly: true,
    });

    const today = new Date().toISOString().slice(0, 10);
    const dailySpecials = await getDailyMenu(tenant.id, today);

    if (products.length === 0 && dailySpecials.length === 0) {
        return 'Nenhum produto cadastrado no momento.';
    }

    const byCategory = new Map<string, typeof products>();
    for (const p of products) {
        if (p.menuType !== 'fixed') continue;
        const key = p.categoryId ?? 'sem-categoria';
        const arr = byCategory.get(key) ?? [];
        arr.push(p);
        byCategory.set(key, arr);
    }

    const lines: string[] = [];

    if (dailySpecials.length > 0) {
        lines.push('### Cardápio do dia');
        for (const p of dailySpecials) {
            lines.push(`- ${p.name} - ${formatBRL(p.price)}${p.description ? ` (${p.description})` : ''}`);
        }
        lines.push('');
    }

    for (const cat of categories) {
        if (
            categoryFilter &&
            !cat.name.toLowerCase().includes(categoryFilter.toLowerCase())
        ) {
            continue;
        }
        const items = byCategory.get(cat.id) ?? [];
        if (items.length === 0) continue;
        lines.push(`### ${cat.name}`);
        for (const p of items) {
            lines.push(
                `- [${p.id}] ${p.name} - ${formatBRL(p.price)}${p.description ? ` (${p.description})` : ''}`
            );
        }
        lines.push('');
    }

    return lines.join('\n').trim() || 'Nenhum produto disponível.';
}

interface CreateOrderAddressInput {
    label?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    zip?: string;
    city?: string;
    state?: string;
    reference_point?: string;
}

interface CreateOrderInput {
    type?: string;
    use_saved_address?: boolean;
    address?: unknown;
    items?: unknown;
    payment_method?: string;
    card_brand?: string;
    change_for?: number;
    notes?: string;
}

function asCleanString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeLabel(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function parseAddressInput(raw: unknown): CreateOrderAddressInput | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const input = raw as Record<string, unknown>;
    return {
        label: asCleanString(input.label) ?? undefined,
        street: asCleanString(input.street) ?? undefined,
        number: asCleanString(input.number) ?? undefined,
        complement: asCleanString(input.complement) ?? undefined,
        neighborhood: asCleanString(input.neighborhood) ?? undefined,
        zip: asCleanString(input.zip) ?? undefined,
        city: asCleanString(input.city) ?? undefined,
        state: asCleanString(input.state) ?? undefined,
        reference_point: asCleanString(input.reference_point) ?? undefined,
    };
}

async function resolveOrderItems(
    tenantId: string,
    rawItems: unknown
): Promise<
    | {
          ok: true;
          items: Array<{
              productId: string;
              productName: string;
              quantity: number;
              unitPrice: number;
              notes?: string;
          }>;
      }
    | { ok: false; error: string }
> {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
        return { ok: false, error: 'items must be a non-empty array' };
    }

    const parsedItems: Array<{
        productId: string;
        quantity: number;
        notes?: string;
    }> = [];

    for (const raw of rawItems) {
        if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
            return { ok: false, error: 'invalid item' };
        }
        const item = raw as Record<string, unknown>;
        const productId = asCleanString(item.product_id);
        const quantity = Number(item.quantity);
        const notes = asCleanString(item.notes) ?? undefined;

        if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
            return { ok: false, error: 'invalid item fields' };
        }

        parsedItems.push({ productId, quantity, notes });
    }

    const uniqueIds = [...new Set(parsedItems.map((item) => item.productId))];
    const products = await getProductsByIds(tenantId, uniqueIds);
    const productsById = new Map(products.map((product) => [product.id, product]));

    const items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        notes?: string;
    }> = [];

    for (const item of parsedItems) {
        const product = productsById.get(item.productId);
        if (!product) {
            return {
                ok: false,
                error: `product not found for tenant: ${item.productId}`,
            };
        }
        if (!product.available) {
            return {
                ok: false,
                error: `product unavailable: ${product.name}`,
            };
        }

        items.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            notes: item.notes,
        });
    }

    return { ok: true, items };
}

async function resolveDeliveryAddress(
    ctx: ToolExecContext,
    input: CreateOrderInput
): Promise<
    | { ok: true; addressId: string | null; addressSummary: string | null }
    | { ok: false; error: string }
> {
    if (input.type !== 'delivery') {
        return { ok: true, addressId: null, addressSummary: null };
    }

    if (!ctx.tenant.deliveryEnabled) {
        return { ok: false, error: 'tenant does not support delivery' };
    }

    if (input.use_saved_address) {
        if (!ctx.defaultAddress) {
            return {
                ok: false,
                error: 'no saved address available for this customer',
            };
        }
        return {
            ok: true,
            addressId: ctx.defaultAddress.id,
            addressSummary: `${ctx.defaultAddress.street}${ctx.defaultAddress.number ? `, ${ctx.defaultAddress.number}` : ''}`,
        };
    }

    const address = parseAddressInput(input.address);
    if (!address?.street) {
        return {
            ok: false,
            error: 'delivery address is required when not using saved address',
        };
    }

    if (
        address.neighborhood &&
        ctx.tenant.deliveryNeighborhoods.length > 0 &&
        !ctx.tenant.deliveryFarNeighborhoods
    ) {
        const requestedNeighborhood = normalizeLabel(address.neighborhood);
        const allowedNeighborhoods = new Set(
            ctx.tenant.deliveryNeighborhoods.map(normalizeLabel)
        );
        if (!allowedNeighborhoods.has(requestedNeighborhood)) {
            return {
                ok: false,
                error: 'delivery neighborhood is outside the configured coverage area',
            };
        }
    }

    const savedAddress = await saveDefaultCustomerAddress({
        customerId: ctx.customer.id,
        label: address.label ?? 'Entrega',
        street: address.street,
        number: address.number ?? null,
        complement: address.complement ?? null,
        neighborhood: address.neighborhood ?? null,
        zip: address.zip ?? null,
        city: address.city ?? ctx.tenant.addrCity ?? null,
        state: address.state ?? ctx.tenant.addrState ?? null,
        referencePoint: address.reference_point ?? null,
    });

    return {
        ok: true,
        addressId: savedAddress.id,
        addressSummary: `${savedAddress.street}${savedAddress.number ? `, ${savedAddress.number}` : ''}`,
    };
}

function validatePayment(
    tenant: Tenant,
    paymentMethod: string | undefined,
    cardBrand: string | undefined
): { ok: true; paymentMethod: 'pix' | 'card' | 'cash'; cardBrand?: string } | { ok: false; error: string } {
    if (
        paymentMethod !== 'pix' &&
        paymentMethod !== 'card' &&
        paymentMethod !== 'cash'
    ) {
        return { ok: false, error: 'invalid payment_method' };
    }

    if (paymentMethod === 'pix' && !tenant.pixKey) {
        return { ok: false, error: 'PIX not configured for this tenant' };
    }

    if (paymentMethod === 'card') {
        if (!tenant.acceptsCard) {
            return { ok: false, error: 'tenant does not accept card payments' };
        }
        const normalizedBrand = asCleanString(cardBrand);
        if (!normalizedBrand) {
            return { ok: false, error: 'card_brand is required for card payments' };
        }
        if (tenant.cardBrands.length > 0) {
            const allowedBrands = new Map(
                tenant.cardBrands.map((brand) => [normalizeLabel(brand), brand])
            );
            const matchedBrand = allowedBrands.get(normalizeLabel(normalizedBrand));
            if (!matchedBrand) {
                return {
                    ok: false,
                    error: `unsupported card brand: ${normalizedBrand}`,
                };
            }
            return { ok: true, paymentMethod, cardBrand: matchedBrand };
        }
        return { ok: true, paymentMethod, cardBrand: normalizedBrand };
    }

    return { ok: true, paymentMethod };
}

async function runCreateOrder(
    ctx: ToolExecContext,
    rawInput: Record<string, unknown>
): Promise<string> {
    const input = rawInput as CreateOrderInput;

    if (input.type !== 'delivery' && input.type !== 'pickup') {
        return JSON.stringify({ error: 'type must be delivery or pickup' });
    }

    const payment = validatePayment(
        ctx.tenant,
        input.payment_method,
        input.card_brand
    );
    if (!payment.ok) {
        return JSON.stringify({ error: payment.error });
    }

    const parsedItems = await resolveOrderItems(ctx.tenant.id, input.items);
    if (!parsedItems.ok) {
        return JSON.stringify({ error: parsedItems.error });
    }

    const delivery = await resolveDeliveryAddress(ctx, input);
    if (!delivery.ok) {
        return JSON.stringify({ error: delivery.error });
    }

    const deliveryFee = input.type === 'delivery' ? ctx.tenant.deliveryFee : 0;
    const pricing = calculatePricing({
        items: parsedItems.items.map((i) => ({
            unitPrice: i.unitPrice,
            quantity: i.quantity,
        })),
        deliveryFee,
    });

    const changeFor =
        payment.paymentMethod === 'cash' && Number.isFinite(Number(input.change_for))
            ? Number(input.change_for)
            : undefined;
    if (
        payment.paymentMethod === 'cash' &&
        changeFor !== undefined &&
        changeFor < pricing.total
    ) {
        return JSON.stringify({
            error: 'change_for must be greater than or equal to order total',
        });
    }

    const order = await createOrder({
        tenantId: ctx.tenant.id,
        customerId: ctx.customer.id,
        addressId: delivery.addressId ?? undefined,
        type: input.type,
        items: parsedItems.items,
        deliveryFee,
        paymentMethod: payment.paymentMethod,
        cardBrand: payment.cardBrand,
        changeFor,
        waitingTimeMinutes: ctx.tenant.waitingTimeMinutes,
        notes: asCleanString(input.notes) ?? undefined,
    });

    return JSON.stringify({
        ok: true,
        order_id: order.id,
        status: order.status,
        subtotal: pricing.subtotal,
        delivery_fee: pricing.deliveryFee,
        total: pricing.total,
        waiting_minutes: ctx.tenant.waitingTimeMinutes,
        payment_method: payment.paymentMethod,
        card_brand: payment.cardBrand ?? null,
        pix_key: payment.paymentMethod === 'pix' ? ctx.tenant.pixKey : null,
        address_summary: delivery.addressSummary,
        summary: `Pedido #${order.id.slice(0, 8)} criado. Total: ${formatBRL(pricing.total)}. Tempo estimado: ${ctx.tenant.waitingTimeMinutes} min.`,
    });
}
