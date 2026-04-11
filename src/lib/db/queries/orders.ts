import { sql } from '@/lib/db';
import type {
    Order,
    OrderItem,
    OrderStatus,
    OrderType,
    PaymentMethod,
} from '@/lib/db/types';

type OrderRow = {
    id: string;
    tenantId: string;
    customerId: string;
    addressId: string | null;
    status: OrderStatus;
    type: OrderType;
    subtotal: string;
    deliveryFee: string;
    discount: string;
    total: string;
    paymentMethod: PaymentMethod | null;
    cardBrand: string | null;
    changeFor: string | null;
    waitingTimeMinutes: number | null;
    notes: string | null;
    createdAt: Date;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
};

// Why: postgres numeric arrives as string and timestamptz as Date — normalize here.
function mapOrder(row: OrderRow): Order {
    return {
        id: row.id,
        tenantId: row.tenantId,
        customerId: row.customerId,
        addressId: row.addressId,
        status: row.status,
        type: row.type,
        subtotal: Number(row.subtotal),
        deliveryFee: Number(row.deliveryFee),
        discount: Number(row.discount),
        total: Number(row.total),
        paymentMethod: row.paymentMethod,
        cardBrand: row.cardBrand,
        changeFor: row.changeFor === null ? null : Number(row.changeFor),
        waitingTimeMinutes: row.waitingTimeMinutes,
        notes: row.notes,
        createdAt: row.createdAt.toISOString(),
        deliveredAt: row.deliveredAt ? row.deliveredAt.toISOString() : null,
        cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
    };
}

type OrderItemRow = {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    notes: string | null;
};

function mapOrderItem(row: OrderItemRow): OrderItem {
    return {
        id: row.id,
        orderId: row.orderId,
        productId: row.productId,
        productName: row.productName,
        quantity: row.quantity,
        unitPrice: Number(row.unitPrice),
        subtotal: Number(row.subtotal),
        notes: row.notes,
    };
}

const orderSelect = sql`
    id,
    tenant_id            as "tenantId",
    customer_id          as "customerId",
    address_id           as "addressId",
    status,
    type,
    subtotal,
    delivery_fee         as "deliveryFee",
    discount,
    total,
    payment_method       as "paymentMethod",
    card_brand           as "cardBrand",
    change_for           as "changeFor",
    waiting_time_minutes as "waitingTimeMinutes",
    notes,
    created_at           as "createdAt",
    delivered_at         as "deliveredAt",
    cancelled_at         as "cancelledAt"
`;

const orderItemSelect = sql`
    id,
    order_id     as "orderId",
    product_id   as "productId",
    product_name as "productName",
    quantity,
    unit_price   as "unitPrice",
    subtotal,
    notes
`;

export async function createOrder(input: {
    tenantId: string;
    customerId: string;
    addressId?: string;
    type: OrderType;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
    }>;
    deliveryFee?: number;
    discount?: number;
    paymentMethod?: PaymentMethod;
    cardBrand?: string;
    changeFor?: number;
    waitingTimeMinutes?: number;
    notes?: string;
}): Promise<Order> {
    const deliveryFee = input.deliveryFee ?? 0;
    const discount = input.discount ?? 0;
    const subtotal = input.items.reduce(
        (acc, it) => acc + it.unitPrice * it.quantity,
        0
    );
    const total = Math.max(0, subtotal + deliveryFee - discount);

    return sql.begin(async (tx) => {
        const rows = await tx<OrderRow[]>`
            insert into orders (
                tenant_id, customer_id, address_id, type,
                subtotal, delivery_fee, discount, total,
                payment_method, card_brand, change_for,
                waiting_time_minutes, notes
            )
            values (
                ${input.tenantId},
                ${input.customerId},
                ${input.addressId ?? null},
                ${input.type},
                ${subtotal},
                ${deliveryFee},
                ${discount},
                ${total},
                ${input.paymentMethod ?? null},
                ${input.cardBrand ?? null},
                ${input.changeFor ?? null},
                ${input.waitingTimeMinutes ?? null},
                ${input.notes ?? null}
            )
            returning ${orderSelect}
        `;
        const order = rows[0];

        for (const item of input.items) {
            const lineSubtotal = item.unitPrice * item.quantity;
            await tx`
                insert into order_items (
                    order_id, product_id, product_name,
                    quantity, unit_price, subtotal
                )
                values (
                    ${order.id},
                    ${item.productId},
                    ${item.productName},
                    ${item.quantity},
                    ${item.unitPrice},
                    ${lineSubtotal}
                )
            `;
        }

        return mapOrder(order);
    });
}

export async function getLastOrderByCustomer(
    customerId: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
    const orderRows = await sql<OrderRow[]>`
        select ${orderSelect}
        from orders
        where customer_id = ${customerId}
        order by created_at desc
        limit 1
    `;
    if (!orderRows[0]) return null;
    const order = mapOrder(orderRows[0]);

    const itemRows = await sql<OrderItemRow[]>`
        select ${orderItemSelect}
        from order_items
        where order_id = ${order.id}
    `;
    return { order, items: itemRows.map(mapOrderItem) };
}

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus
): Promise<Order> {
    const rows = await sql<OrderRow[]>`
        update orders
        set status = ${status},
            updated_at = now(),
            delivered_at = case when ${status} = 'entregue' then now() else delivered_at end,
            cancelled_at = case when ${status} = 'cancelado' then now() else cancelled_at end
        where id = ${orderId}
        returning ${orderSelect}
    `;
    return mapOrder(rows[0]);
}
