import type { FastifyInstance } from 'fastify';
import {
    ensureInstanceReady,
    fetchInstanceByName,
    connectInstance,
    logoutInstance,
    getConnectionState,
} from '../lib/evolution/manager.js';

export async function evolutionRoutes(app: FastifyInstance) {
    // POST /evolution/instance
    app.post('/instance', async (request, reply) => {
        const { instanceName, webhookUrl } = request.body as {
            instanceName?: string;
            webhookUrl?: string;
        };
        if (!instanceName || !webhookUrl) {
            return reply.status(400).send({ error: 'instanceName and webhookUrl are required' });
        }
        const result = await ensureInstanceReady({ instanceName, webhookUrl });
        reply.send(result);
    });

    // GET /evolution/instances/:slug
    app.get('/instances/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const instance = await fetchInstanceByName(slug);
        if (!instance) {
            return reply.status(404).send({ error: 'Instance not found' });
        }
        const state = await getConnectionState(slug);
        reply.send({ instance, state });
    });

    // POST /evolution/instances/:slug/connect
    app.post('/instances/:slug/connect', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const qr = await connectInstance(slug);
        reply.send(qr);
    });

    // POST /evolution/instances/:slug/disconnect
    app.post('/instances/:slug/disconnect', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        await logoutInstance(slug);
        reply.send({ ok: true });
    });
}
