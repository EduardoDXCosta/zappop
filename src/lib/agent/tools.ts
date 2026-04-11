import type { AIToolDefinition, AIToolCall } from '@/lib/ai';
import type { Tenant, Customer } from '@/lib/db/types';
import {
    getCategoriesByTenant,
    getProductsByTenant,
    getDailyMenu,
    createOrder,
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
            lines.push(`- ${p.name} — ${formatBRL(p.price)}${p.description ? ` (${p.description})` : ''}`);
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
                `- [${p.id}] ${p.name} — ${formatBRL(p.price)}${p.description ? ` (${p.description})` : ''}`
            );
        }
        lines.push('');
    }

    return lines.join('\n').trim() || 'Nenhum produto disponível.';
}

interface CreateOrderInput {
    type?: string;
    items?: unknown;
    payment_method?: string;
    card_brand?: string;
    change_for?: number;
    notes?: string;
}

async function runCreateOrder(
    ctx: ToolExecContext,
    rawInput: Record<string, unknown>
): Promise<string> {
    const input = rawInput as CreateOrderInput;

    if (input.type !== 'delivery' && input.type !== 'pickup') {
        return JSON.stringify({ error: 'type must be delivery or pickup' });
    }
    if (
        input.payment_method !== 'pix' &&
        input.payment_method !== 'card' &&
        input.payment_method !== 'cash'
    ) {
        return JSON.stringify({ error: 'invalid payment_method' });
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
        return JSON.stringify({ error: 'items must be a non-empty array' });
    }

    const items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
    }> = [];
    for (const raw of input.items) {
        if (typeof raw !== 'object' || raw === null) {
            return JSON.stringify({ error: 'invalid item' });
        }
        const r = raw as Record<string, unknown>;
        const productId = typeof r.product_id === 'string' ? r.product_id : null;
        const productName =
            typeof r.product_name === 'string' ? r.product_name : null;
        const quantity = Number(r.quantity);
        const unitPrice = Number(r.unit_price);
        if (
            !productId ||
            !productName ||
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
        ) {
            return JSON.stringify({ error: 'invalid item fields' });
        }
        items.push({ productId, productName, quantity, unitPrice });
    }

    const deliveryFee =
        input.type === 'delivery' ? ctx.tenant.deliveryFee : 0;
    const pricing = calculatePricing({
        items: items.map((i) => ({
            unitPrice: i.unitPrice,
            quantity: i.quantity,
        })),
        deliveryFee,
    });

    const order = await createOrder({
        tenantId: ctx.tenant.id,
        customerId: ctx.customer.id,
        type: input.type,
        items,
        deliveryFee,
        paymentMethod: input.payment_method,
        cardBrand: input.card_brand,
        changeFor: input.change_for,
        waitingTimeMinutes: ctx.tenant.waitingTimeMinutes,
        notes: input.notes,
    });

    return JSON.stringify({
        ok: true,
        order_id: order.id,
        status: order.status,
        subtotal: pricing.subtotal,
        delivery_fee: pricing.deliveryFee,
        total: pricing.total,
        waiting_minutes: ctx.tenant.waitingTimeMinutes,
        summary: `Pedido #${order.id.slice(0, 8)} criado. Total: ${formatBRL(pricing.total)}. Tempo estimado: ${ctx.tenant.waitingTimeMinutes} min.`,
    });
}
