import type { FastifyInstance } from 'fastify';
import { handleTestMessage } from '../lib/agent/test-runtime.js';
import { getRecentChats } from '../db/queries/chats.js';

export async function testChatRoutes(app: FastifyInstance) {
    // POST /test-chat
    app.post('/', async (request, reply) => {
        const { tenantId, message } = request.body as { tenantId?: string; message?: string };
        if (!tenantId || !message) {
            return reply.status(400).send({ error: 'tenantId and message are required' });
        }
        const result = await handleTestMessage({ tenantId, message });
        reply.send(result);
    });

    // GET /test-chat/history
    app.get('/history', async (request, reply) => {
        const { tenantId } = request.query as { tenantId?: string };
        if (!tenantId) {
            return reply.status(400).send({ error: 'tenantId is required' });
        }
        const sessionId = `test_${tenantId}`;
        const chats = await getRecentChats(sessionId, 50);
        reply.send({ chats });
    });
}
