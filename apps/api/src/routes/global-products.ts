import type { FastifyInstance } from 'fastify';
import {
    getGlobalProducts,
    createGlobalProduct,
    updateGlobalProduct,
    deleteGlobalProduct,
} from '../db/queries/global-products.js';

export async function globalProductsRoutes(app: FastifyInstance) {
    // GET /global-products
    app.get('/', async (_request, reply) => {
        const products = await getGlobalProducts();
        reply.send({ products });
    });

    // POST /global-products
    app.post('/', async (request, reply) => {
        if (request.session.role !== 'admin') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const body = request.body as Record<string, unknown>;
        const product = await createGlobalProduct({
            name: body.name as string,
            description: (body.description as string) || undefined,
            imageUrl: (body.imageUrl as string) || undefined,
            category: (body.category as string) || 'Outros',
        });
        reply.send({ product });
    });

    // PATCH /global-products/:id
    app.patch('/:id', async (request, reply) => {
        if (request.session.role !== 'admin') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, unknown>;
        const product = await updateGlobalProduct(id, body);
        reply.send({ product });
    });

    // DELETE /global-products/:id
    app.delete('/:id', async (request, reply) => {
        if (request.session.role !== 'admin') {
            return reply.status(403).send({ error: 'Admin only' });
        }
        const { id } = request.params as { id: string };
        await deleteGlobalProduct(id);
        reply.send({ ok: true });
    });
}
