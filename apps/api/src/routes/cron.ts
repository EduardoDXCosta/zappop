import type { FastifyInstance } from 'fastify';
import { getPendingCarts, getRecoveredCartRevenue } from '../db/queries/cart-sessions.js';
import { getEvolutionClient } from '../lib/evolution/client.js';

export async function cronRoutes(app: FastifyInstance) {
    // Verify cron secret
    app.addHook('onRequest', async (request, reply) => {
        const secret = process.env.CRON_SECRET;
        if (secret) {
            const authHeader = (request.headers.authorization ?? '') as string;
            const token = authHeader.replace(/^Bearer\s+/i, '').trim();
            if (token !== secret) {
                return reply.status(401).send({ error: 'unauthorized' });
            }
        }
    });

    // POST /cron/abandoned-carts
    app.post('/abandoned-carts', async (request, reply) => {
        const carts = await getPendingCarts(20);

        let sent = 0;
        const evo = getEvolutionClient();

        for (const cart of carts) {
            try {
                await evo.sendText(
                    cart.tenantId,
                    cart.sessionId,
                    'Oi! Vi que você não finalizou o pedido. Posso te ajudar com alguma coisa? 😊',
                );
                sent++;
            } catch (err) {
                request.log.error(err, `[cron] failed to send recovery to ${cart.sessionId}`);
            }
        }

        reply.send({ recovered: sent, total: carts.length });
    });

    // GET /cron/recovered-revenue
    app.get('/recovered-revenue', async (_request, reply) => {
        const revenue = await getRecoveredCartRevenue();
        reply.send({ revenue });
    });
}
