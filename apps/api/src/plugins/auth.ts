import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { getSessionByToken } from '../db/queries/session-tokens.js';
import { getUserById } from '../db/queries/users.js';
import { getTenantById } from '../db/queries/tenants.js';
import type { SessionContext } from '@whatsmenu/shared';

declare module 'fastify' {
    interface FastifyRequest {
        session: SessionContext;
    }
}

async function authPluginFn(app: FastifyInstance) {
    app.decorateRequest('session', null as unknown as SessionContext);

    app.addHook('onRequest', async (request: FastifyRequest) => {
        const defaultSession: SessionContext = {
            user: null,
            tenant: null,
            role: 'owner',
            impersonating: false,
        };

        // Extract token from Authorization header or cookie
        let token: string | undefined;

        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        if (!token) {
            token = request.cookies?.session_token;
        }

        if (!token) {
            request.session = defaultSession;
            return;
        }

        const sessionRow = await getSessionByToken(token);
        if (!sessionRow) {
            request.session = defaultSession;
            return;
        }

        const user = await getUserById(sessionRow.userId);
        if (!user) {
            request.session = defaultSession;
            return;
        }

        // Handle admin impersonation
        if (user.role === 'admin') {
            const impersonateId =
                (request.headers['x-impersonate-tenant'] as string) ||
                request.cookies?.impersonate_tenant;

            if (impersonateId) {
                const tenant = await getTenantById(impersonateId);
                if (tenant) {
                    request.session = { user, tenant, role: 'admin', impersonating: true };
                    return;
                }
            }
            request.session = { user, tenant: null, role: 'admin', impersonating: false };
            return;
        }

        const tenant = user.tenantId ? await getTenantById(user.tenantId) : null;
        request.session = { user, tenant, role: 'owner', impersonating: false };
    });
}

export const authPlugin = fp(authPluginFn, {
    name: 'auth-plugin',
});
