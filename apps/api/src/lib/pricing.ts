export interface PricingLineItem {
  unitPrice: number;
  quantity: number;
  addons?: Array<{ price: number }>;
}

export interface PricingInput {
  items: PricingLineItem[];
  deliveryFee?: number;
  discount?: number;
  discountPercent?: number;
}

export interface PricingResult {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

// Why: avoid JS float drift when summing currency values.
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculatePricing(input: PricingInput): PricingResult {
  const rawSubtotal = input.items.reduce((acc, item) => {
    const addonsSum = (item.addons ?? []).reduce((a, x) => a + (x.price || 0), 0);
    return acc + (item.unitPrice + addonsSum) * item.quantity;
  }, 0);
  const subtotal = round2(rawSubtotal);

  const deliveryFee = round2(input.deliveryFee ?? 0);

  const percent = input.discountPercent ?? 0;
  const percentDiscount = subtotal * (percent / 100);
  const absoluteDiscount = input.discount ?? 0;
  const totalDiscount = round2(percentDiscount + absoluteDiscount);

  const rawTotal = subtotal - totalDiscount + deliveryFee;
  const total = round2(Math.max(0, rawTotal));

  return {
    subtotal,
    deliveryFee,
    discount: totalDiscount,
    total,
  };
}

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(amount: number): string {
  return BRL_FORMATTER.format(amount);
}
