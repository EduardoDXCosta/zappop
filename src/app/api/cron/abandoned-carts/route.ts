import { NextResponse } from 'next/server';
import { getEvolutionClient } from '@/lib/evolution';
import { getPendingCarts, markCartRecovered, getTenantById } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const pendingCarts = await getPendingCarts(20);

        let recovered = 0;
        let failed = 0;

        for (const cart of pendingCarts) {
            try {
                const tenant = await getTenantById(cart.tenantId);
                if (!tenant) {
                    failed++;
                    continue;
                }

                const evo = getEvolutionClient();
                const instance = tenant.slug;
                const text =
                    'Oi! Vi que você não finalizou seu pedido. Quer que eu feche ele aqui para você? 😊';

                const result = await evo.sendText(instance, cart.sessionId, text);
                if (!result.ok) {
                    console.error('[abandoned-carts] failed to send message', result.error);
                    failed++;
                    continue;
                }

                await markCartRecovered(cart.id);
                recovered++;
            } catch (err) {
                console.error('[abandoned-carts] error processing cart', cart.id, err);
                failed++;
            }
        }

        return NextResponse.json({
            ok: true,
            pending: pendingCarts.length,
            recovered,
            failed,
        });
    } catch (error) {
        console.error('[abandoned-carts] error', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
