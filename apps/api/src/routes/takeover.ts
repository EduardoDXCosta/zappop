import type { FastifyInstance } from 'fastify';
import { createTakeover, releaseTakeover, getActiveTakeover } from '../db/queries/human-takeovers.js';
import { getRecentChats } from '../db/queries/chats.js';

export async function takeoverRoutes(app: FastifyInstance) {
    // POST /takeover
    app.post('/', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'unauthorized' });
        }
        const { sessionId, durationMinutes } = request.body as {
            sessionId?: string;
            durationMinutes?: number;
        };
        if (!sessionId) {
            return reply.status(400).send({ error: 'sessionId is required' });
        }
        const takeover = await createTakeover(
            sessionId,
            request.session.tenant.id,
            request.session.user?.id ?? null,
            durationMinutes,
        );
        reply.send({ takeover });
    });

    // DELETE /takeover
    app.delete('/', async (request, reply) => {
        if (!request.session.tenant) {
            return reply.status(403).send({ error: 'unauthorized' });
        }
        const { sessionId } = request.body as { sessionId?: string };
        if (!sessionId) {
            return reply.status(400).send({ error: 'sessionId is required' });
        }
        await releaseTakeover(sessionId);
        reply.send({ ok: true });
    });

    // GET /takeover/active
    app.get('/active', async (request, reply) => {
        const { sessionId } = request.query as { sessionId?: string };
        if (!sessionId) {
            return reply.status(400).send({ error: 'sessionId is required' });
        }
        const takeover = await getActiveTakeover(sessionId);
        reply.send({ takeover });
    });

    // GET /takeover/conversations
    app.get('/conversations', async (request, reply) => {
        const { sessionId, limit } = request.query as { sessionId?: string; limit?: string };
        if (!sessionId) {
            return reply.status(400).send({ error: 'sessionId is required' });
        }
        const chats = await getRecentChats(sessionId, Number(limit) || 50);
        reply.send({ chats });
    });
}
