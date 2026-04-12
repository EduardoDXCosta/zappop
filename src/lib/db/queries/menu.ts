import { sql } from '@/lib/db';

export type CategoryRow = {
  id: string;
  tenantId: string;
  name: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
};

export type ProductRow = {
  id: string;
  tenantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  menuType: 'fixed' | 'daily';
  availableOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// CRUD Categorias
export async function createCategory(
  tenantId: string,
  name: string,
  sortOrder: number = 0
): Promise<CategoryRow> {
  const [row] = await sql<CategoryRow[]>`
    insert into categories (tenant_id, name, sort_order, active)
    values (${tenantId}, ${name}, ${sortOrder}, true)
    returning
      id,
      tenant_id as "tenantId",
      name,
      sort_order as "sortOrder",
      active,
      created_at as "createdAt"
  `;
  return row;
}

export async function getCategories(tenantId: string): Promise<CategoryRow[]> {
  return sql<CategoryRow[]>`
    select
      id,
      tenant_id as "tenantId",
      name,
      sort_order as "sortOrder",
      active,
      created_at as "createdAt"
    from categories
    where tenant_id = ${tenantId}
    order by sort_order asc, created_at desc
  `;
}

// CRUD Produtos
export async function createProduct(
  tenantId: string,
  categoryId: string | null,
  name: string,
  description: string | null,
  price: number,
  imageUrl: string | null = null
): Promise<ProductRow> {
  const [row] = await sql<ProductRow[]>`
    insert into products (tenant_id, category_id, name, description, price, available, menu_type, image_url)
    values (${tenantId}, ${categoryId}, ${name}, ${description}, ${price}, true, 'fixed', ${imageUrl})
    returning
      id,
      tenant_id as "tenantId",
      category_id as "categoryId",
      name,
      description,
      price::float as price,
      image_url as "imageUrl",
      available,
      menu_type as "menuType",
      available_on as "availableOn",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return row;
}

export async function getProducts(tenantId: string): Promise<ProductRow[]> {
  return sql<ProductRow[]>`
    select
      id,
      tenant_id as "tenantId",
      category_id as "categoryId",
      name,
      description,
      price::float as price,
      image_url as "imageUrl",
      available,
      menu_type as "menuType",
      available_on as "availableOn",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from products
    where tenant_id = ${tenantId}
    order by created_at desc
  `;
}

export async function updateProductPrice(
  id: string,
  price: number
): Promise<ProductRow | null> {
  const rows = await sql<ProductRow[]>`
    update products
    set price = ${price}
    where id = ${id}
    returning
      id,
      tenant_id as "tenantId",
      category_id as "categoryId",
      name,
      description,
      price::float as price,
      image_url as "imageUrl",
      available,
      menu_type as "menuType",
      available_on as "availableOn",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return rows[0] ?? null;
}

export async function updateProductAvailability(
  id: string,
  available: boolean
): Promise<ProductRow | null> {
  const rows = await sql<ProductRow[]>`
    update products
    set available = ${available}
    where id = ${id}
    returning
      id,
      tenant_id as "tenantId",
      category_id as "categoryId",
      name,
      description,
      price::float as price,
      image_url as "imageUrl",
      available,
      menu_type as "menuType",
      available_on as "availableOn",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;
  return rows[0] ?? null;
}
