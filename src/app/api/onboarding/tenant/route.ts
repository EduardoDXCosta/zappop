import { NextResponse } from 'next/server';
import { createTenant, getTenantBySlug, replaceTenantHours } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseHours(value: unknown): Array<{
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
}> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        return null;
      }
      const record = item as Record<string, unknown>;
      const dayOfWeek = Number(record.dayOfWeek);
      const opensAt = cleanString(record.opensAt);
      const closesAt = cleanString(record.closesAt);

      if (
        !Number.isInteger(dayOfWeek) ||
        dayOfWeek < 0 ||
        dayOfWeek > 6 ||
        !opensAt ||
        !closesAt
      ) {
        return null;
      }

      return {
        dayOfWeek,
        opensAt: `${opensAt}:00`,
        closesAt: `${closesAt}:00`,
      };
    })
    .filter(
      (
        item
      ): item is { dayOfWeek: number; opensAt: string; closesAt: string } =>
        item !== null
    );
}

async function buildUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  let counter = 2;

  while (candidate) {
    const existing = await getTenantBySlug(candidate);
    if (!existing) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  throw new Error('Não foi possível gerar um slug único para o restaurante.');
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const name = cleanString(body.name);
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const slugBase = toSlug(cleanString(body.slug) ?? name);
  if (!slugBase) {
    return NextResponse.json(
      { error: 'could not derive slug from name' },
      { status: 400 }
    );
  }

  const hours = parseHours(body.hours);
  if (hours.length === 0) {
    return NextResponse.json(
      { error: 'at least one opening day is required' },
      { status: 400 }
    );
  }

  const tenant = await createTenant({
    slug: await buildUniqueSlug(slugBase),
    name,
    cpf: cleanString(body.cpf) ?? undefined,
    cnpj: cleanString(body.cnpj) ?? undefined,
    logoUrl: cleanString(body.logoUrl) ?? undefined,
    whatsappCustomerNumber: cleanString(body.whatsappCustomerNumber) ?? undefined,
    whatsappAdminNumber: cleanString(body.whatsappAdminNumber) ?? undefined,
    addrStreet: cleanString(body.addrStreet) ?? undefined,
    addrNumber: cleanString(body.addrNumber) ?? undefined,
    addrNeighborhood: cleanString(body.addrNeighborhood) ?? undefined,
    addrZip: cleanString(body.addrZip) ?? undefined,
    addrCity: cleanString(body.addrCity) ?? undefined,
    addrState: cleanString(body.addrState) ?? undefined,
    deliveryEnabled: body.deliveryEnabled !== false,
    deliveryFee: parseNumber(body.deliveryFee, 0),
    deliveryFarNeighborhoods: body.deliveryFarNeighborhoods === true,
    deliveryNeighborhoods:
      Array.isArray(body.deliveryNeighborhoods)
        ? body.deliveryNeighborhoods.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0
          )
        : [],
    waitingTimeMinutes: parseNumber(body.waitingTimeMinutes, 30),
    acceptsCard: body.acceptsCard === true,
    cardBrands: Array.isArray(body.cardBrands)
      ? body.cardBrands.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
      : [],
    acceptsVoucher: body.acceptsVoucher === true,
    voucherBrands: Array.isArray(body.voucherBrands)
      ? body.voucherBrands.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        )
      : [],
    issuesNfCpf: body.issuesNfCpf === true,
    pixKey: cleanString(body.pixKey) ?? undefined,
  });

  await replaceTenantHours({
    tenantId: tenant.id,
    hours,
  });

  return NextResponse.json({
    tenant: {
      slug: tenant.slug,
      name: tenant.name,
    },
  });
}
