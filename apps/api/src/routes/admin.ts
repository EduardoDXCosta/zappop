import type { FastifyInstance } from 'fastify';
import { getPlatformMetrics } from '../db/queries/metrics.js';
import { getAllTenants } from '../db/queries/tenants.js';

export async function adminRoutes(app: FastifyInstance) {
    // Require admin role for all admin routes
    app.addHook('onRequest', async (request, reply) => {
        if (request.session.role !== 'admin') {
            return reply.status(403).send({ error: 'Não autorizado' });
        }
    });

    // GET /admin/tenants
    app.get('/tenants', async (_request, reply) => {
        const tenants = await getAllTenants();
        reply.send({ tenants });
    });

    // GET /admin/metrics
    app.get('/metrics', async (_request, reply) => {
        const metrics = await getPlatformMetrics();
        reply.send({ metrics });
    });

    // POST /admin/impersonate
    app.post('/impersonate', async (request, reply) => {
        const { tenantId } = request.body as { tenantId?: string };
        if (!tenantId) {
            return reply.status(400).send({ error: 'tenantId is required' });
        }

        reply
            .setCookie('impersonate_tenant', tenantId, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 86400,
            })
            .send({ ok: true });
    });

    // DELETE /admin/impersonate
    app.delete('/impersonate', async (_request, reply) => {
        reply
            .setCookie('impersonate_tenant', '', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 0,
            })
            .send({ ok: true });
    });
}
