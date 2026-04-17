import { sql } from '../connection.js';
import type {
    Category,
    Product,
    ProductAddon,
    MenuType,
} from '../types.js';

type ProductRow = {
    id: string;
    tenantId: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    available: boolean;
    menuType: MenuType;
    availableOn: Date | null;
};

// Why: postgres numeric arrives as string; date columns arrive as Date.
function mapProduct(row: ProductRow): Product {
    return {
        id: row.id,
        tenantId: row.tenantId,
        categoryId: row.categoryId,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        imageUrl: row.imageUrl,
        available: row.available,
        menuType: row.menuType,
        availableOn:
            row.availableOn instanceof Date
                ? row.availableOn.toISOString().slice(0, 10)
                : row.availableOn,
    };
}

const productSelect = sql`
    id,
    tenant_id    as "tenantId",
    category_id  as "categoryId",
    name,
    description,
    price,
    image_url    as "imageUrl",
    available,
    menu_type    as "menuType",
    available_on as "availableOn"
`;

export async function getCategoriesByTenant(
    tenantId: string
): Promise<Category[]> {
    const rows = await sql<Category[]>`
        select
            id,
            tenant_id  as "tenantId",
            name,
            sort_order as "sortOrder",
            active
        from categories
        where tenant_id = ${tenantId} and active = true
        order by sort_order asc, name asc
    `;
    return rows;
}

export async function getProductsByTenant(
    tenantId: string,
    opts?: { categoryId?: string; availableOnly?: boolean }
): Promise<Product[]> {
    const categoryId = opts?.categoryId;
    const availableOnly = opts?.availableOnly ?? false;
    const rows = await sql<ProductRow[]>`
        select ${productSelect}
        from products
        where tenant_id = ${tenantId}
          ${categoryId ? sql`and category_id = ${categoryId}` : sql``}
          ${availableOnly ? sql`and available = true` : sql``}
        order by name asc
    `;
    return rows.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
    const rows = await sql<ProductRow[]>`
        select ${productSelect} from products where id = ${id} limit 1
    `;
    return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductsByIds(
    tenantId: string,
    ids: string[]
): Promise<Product[]> {
    if (ids.length === 0) return [];
    const rows = await sql<ProductRow[]>`
        select ${productSelect}
        from products
        where tenant_id = ${tenantId}
          and id in ${sql(ids)}
    `;
    return rows.map(mapProduct);
}

export async function getProductAddons(
    productId: string
): Promise<ProductAddon[]> {
    const rows = await sql<
        {
            id: string;
            productId: string;
            name: string;
            price: string;
            required: boolean;
            maxQuantity: number;
            sortOrder: number;
        }[]
    >`
        select
            id,
            product_id   as "productId",
            name,
            price,
            required,
            max_quantity as "maxQuantity",
            sort_order   as "sortOrder"
        from product_addons
        where product_id = ${productId}
        order by sort_order asc, name asc
    `;
    return rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        name: r.name,
        price: Number(r.price),
        required: r.required,
        maxQuantity: r.maxQuantity,
        sortOrder: r.sortOrder,
    }));
}

export async function getDailyMenu(
    tenantId: string,
    date: string
): Promise<Product[]> {
    const rows = await sql<ProductRow[]>`
        select ${productSelect}
        from products
        where tenant_id = ${tenantId}
          and menu_type = 'daily'
          and available_on = ${date}
          and available = true
        order by name asc
    `;
    return rows.map(mapProduct);
}
