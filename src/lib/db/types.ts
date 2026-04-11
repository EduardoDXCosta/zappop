export type TenantPlan = 'start' | 'advanced' | 'premium';
export type TenantPlanStatus =
    | 'trial'
    | 'active'
    | 'past_due'
    | 'blocked'
    | 'cancelled';
export type AiProvider = 'claude' | 'gpt' | 'gemini';

export interface Tenant {
    id: string;
    slug: string;
    name: string;
    aiProvider: AiProvider;
    aiApiKeyEncrypted: string | null;
    plan: TenantPlan;
    planStatus: TenantPlanStatus;
    vacationMode: boolean;
    waitingTimeMinutes: number;
    whatsappCustomerNumber: string | null;
    whatsappAdminNumber: string | null;
    addrStreet: string | null;
    addrNumber: string | null;
    addrNeighborhood: string | null;
    addrZip: string | null;
    addrCity: string | null;
    addrState: string | null;
    // Why: postgres numeric arrives as string; converted to number at the boundary.
    addrLat: number | null;
    addrLng: number | null;
    deliveryEnabled: boolean;
    deliveryFee: number;
    deliveryFarNeighborhoods: boolean;
    deliveryRadiusKm: number | null;
    deliveryNeighborhoods: string[];
}

export interface TenantHours {
    id: string;
    tenantId: string;
    dayOfWeek: number;
    shift: number;
    opensAt: string;
    closesAt: string;
}

export interface TenantException {
    id: string;
    tenantId: string;
    date: string;
    closed: boolean;
    note: string | null;
}

export interface Customer {
    id: string;
    tenantId: string;
    phone: string;
    name: string | null;
    notes: string | null;
    blocked: boolean;
    blockReason: string | null;
    lastOrderAt: string | null;
}

export interface CustomerAddress {
    id: string;
    customerId: string;
    label: string | null;
    street: string;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    zip: string | null;
    city: string | null;
    state: string | null;
    referencePoint: string | null;
    isDefault: boolean;
}

export interface Category {
    id: string;
    tenantId: string;
    name: string;
    sortOrder: number;
    active: boolean;
}

export type MenuType = 'fixed' | 'daily';

export interface Product {
    id: string;
    tenantId: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    available: boolean;
    menuType: MenuType;
    availableOn: string | null;
}

export interface ProductAddon {
    id: string;
    productId: string;
    name: string;
    price: number;
    required: boolean;
    maxQuantity: number;
    sortOrder: number;
}

export type ConversationRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Conversation {
    id: string;
    tenantId: string;
    customerId: string;
    role: ConversationRole;
    content: string;
    metadata: unknown;
    createdAt: string;
}

export type OrderStatus =
    | 'aguardando'
    | 'aceito'
    | 'em_preparo'
    | 'saiu_entrega'
    | 'entregue'
    | 'cancelado';
export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface Order {
    id: string;
    tenantId: string;
    customerId: string;
    addressId: string | null;
    status: OrderStatus;
    type: OrderType;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod | null;
    cardBrand: string | null;
    changeFor: number | null;
    waitingTimeMinutes: number | null;
    notes: string | null;
    createdAt: string;
    deliveredAt: string | null;
    cancelledAt: string | null;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes: string | null;
}
