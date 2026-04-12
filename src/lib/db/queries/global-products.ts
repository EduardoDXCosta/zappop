import { sql } from '@/lib/db';
import type { GlobalProduct } from '@/lib/db/types';

type GlobalProductRow = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category: string;
    createdAt: Date;
    updatedAt: Date;
};

function mapGlobalProduct(row: GlobalProductRow): GlobalProduct {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl,
        category: row.category,
        createdAt:
            row.createdAt instanceof Date
                ? row.createdAt.toISOString()
                : String(row.createdAt),
        updatedAt:
            row.updatedAt instanceof Date
                ? row.updatedAt.toISOString()
                : String(row.updatedAt),
    };
}

const gpSelect = sql`
    id,
    name,
    description,
    image_url  as "imageUrl",
    category,
    created_at as "createdAt",
    updated_at as "updatedAt"
`;

export async function getGlobalProducts(): Promise<GlobalProduct[]> {
    const rows = await sql<GlobalProductRow[]>`
        select ${gpSelect} from global_products order by category asc, name asc
    `;
    return rows.map(mapGlobalProduct);
}

export async function getGlobalProductById(
    id: string
): Promise<GlobalProduct | null> {
    const rows = await sql<GlobalProductRow[]>`
        select ${gpSelect} from global_products where id = ${id} limit 1
    `;
    return rows[0] ? mapGlobalProduct(rows[0]) : null;
}

export async function createGlobalProduct(input: {
    name: string;
    description?: string;
    imageUrl?: string;
    category: string;
}): Promise<GlobalProduct> {
    const rows = await sql<GlobalProductRow[]>`
        insert into global_products (name, description, image_url, category)
        values (
            ${input.name},
            ${input.description ?? null},
            ${input.imageUrl ?? null},
            ${input.category}
        )
        returning ${gpSelect}
    `;
    return mapGlobalProduct(rows[0]);
}

export async function updateGlobalProduct(
    id: string,
    input: {
        name?: string;
        description?: string | null;
        imageUrl?: string | null;
        category?: string;
    }
): Promise<GlobalProduct | null> {
    const rows = await sql<GlobalProductRow[]>`
        update global_products
        set
            name        = coalesce(${input.name ?? null}, name),
            description = coalesce(${input.description ?? null}, description),
            image_url   = coalesce(${input.imageUrl ?? null}, image_url),
            category    = coalesce(${input.category ?? null}, category)
        where id = ${id}
        returning ${gpSelect}
    `;
    return rows[0] ? mapGlobalProduct(rows[0]) : null;
}

export async function deleteGlobalProduct(id: string): Promise<boolean> {
    const result = await sql`
        delete from global_products where id = ${id}
    `;
    return result.count > 0;
}

export async function cloneGlobalProductToTenant(
    globalProductId: string,
    tenantId: string,
    categoryId: string,
    price: number
): Promise<{ id: string }> {
    const rows = await sql<{ id: string }[]>`
        insert into products (tenant_id, category_id, name, description, image_url, price, available, menu_type, global_product_id)
        select
            ${tenantId},
            ${categoryId},
            gp.name,
            gp.description,
            gp.image_url,
            ${price},
            true,
            'fixed',
            gp.id
        from global_products gp
        where gp.id = ${globalProductId}
        returning id
    `;
    return rows[0];
}
