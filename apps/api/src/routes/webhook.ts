import type { FastifyInstance } from 'fastify';
import { parseEvolutionEvent } from '../lib/evolution/webhook.js';
import { handleIncomingMessage } from '../lib/agent/runtime.js';

export async function webhookRoutes(app: FastifyInstance) {
    // POST /webhook/evolution
    app.post('/evolution', async (request, reply) => {
        const expected = process.env.EVOLUTION_WEBHOOK_TOKEN;
        if (expected) {
            const authHeader = (request.headers.authorization ?? request.headers['x-webhook-token'] ?? '') as string;
            const token = authHeader.replace(/^Bearer\s+/i, '').trim();
            const queryToken = (request.query as Record<string, string>).token?.trim() ?? '';
            if (token !== expected && queryToken !== expected) {
                return reply.status(401).send({ error: 'unauthorized' });
            }
        }

        const parsed = parseEvolutionEvent(request.body);

        if (parsed.event === 'ignored') {
            return reply.send({ ok: true, ignored: parsed.reason });
        }

        // Fire-and-forget so Evolution gets a 200 fast
        handleIncomingMessage(parsed).catch((err) => {
            request.log.error(err, '[webhook] agent error');
        });

        reply.send({ ok: true });
    });

    // GET /webhook/evolution
    app.get('/evolution', async (_request, reply) => {
        reply.send({ status: 'evolution webhook ready' });
    });
}
