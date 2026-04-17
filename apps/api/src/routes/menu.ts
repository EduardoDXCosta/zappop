import type { FastifyInstance } from 'fastify';
import { createProduct, getProducts, createCategory, getCategories, updateProductPrice, updateProductAvailability } from '../db/queries/menu.js';
import { cloneGlobalProductToTenant } from '../db/queries/global-products.js';

export async function menuRoutes(app: FastifyInstance) {
    // GET /menu/categories
    app.get('/categories', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'No tenant' });
        }
        const categories = await getCategories(request.session.tenant.id);
        reply.send({ categories });
    });

    // POST /menu/categories
    app.post('/categories', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'No tenant' });
        }
        const { name } = request.body as { name?: string };
        if (!name || name.trim().length === 0) {
            return reply.status(400).send({ error: 'Nome da categoria é obrigatório' });
        }
        const category = await createCategory(request.session.tenant.id, name.trim());
        reply.send({ category });
    });

    // GET /menu/products
    app.get('/products', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'No tenant' });
        }
        const products = await getProducts(request.session.tenant.id);
        reply.send({ products });
    });

    // POST /menu/products
    app.post('/products', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'No tenant' });
        }
        const body = request.body as Record<string, unknown>;
        if (typeof body.name !== 'string' || body.name.trim().length === 0) {
            return reply.status(400).send({ error: 'Nome do produto é obrigatório' });
        }
        const price = Number(body.price);
        if (isNaN(price) || price < 0) {
            return reply.status(400).send({ error: 'Preço inválido' });
        }
        const product = await createProduct(
            request.session.tenant.id,
            typeof body.categoryId === 'string' && body.categoryId.trim().length > 0 ? body.categoryId : null,
            body.name.trim(),
            typeof body.description === 'string' ? body.description.trim() || null : null,
            price,
            typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : null,
        );
        reply.send({ product });
    });

    // PATCH /menu/products/:id
    app.patch('/products/:id', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'No tenant' });
        }
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, unknown>;
        if (typeof body.price === 'number') {
            const product = await updateProductPrice(id, body.price);
            return reply.send({ product });
        }
        if (typeof body.available === 'boolean') {
            const product = await updateProductAvailability(id, body.available);
            return reply.send({ product });
        }
        return reply.status(400).send({ error: 'Nenhum campo válido para atualizar' });
    });

    // POST /menu/products/clone
    app.post('/products/clone', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'No tenant' });
        }
        const { globalProductId, categoryId, price } = request.body as {
            globalProductId?: string;
            categoryId?: string;
            price?: number;
        };
        if (!globalProductId || !categoryId) {
            return reply.status(400).send({ error: 'globalProductId e categoryId são obrigatórios' });
        }
        const product = await cloneGlobalProductToTenant(
            globalProductId,
            request.session.tenant.id,
            categoryId,
            typeof price === 'number' ? price : 0,
        );
        reply.send({ product });
    });
}
