import type { FastifyInstance } from 'fastify';
import { getUserWithPassword, updateLastLogin } from '../db/queries/users.js';
import { createSessionToken, deleteSessionToken } from '../db/queries/session-tokens.js';
import { verifyPassword } from '../lib/auth/password.js';

export async function authRoutes(app: FastifyInstance) {
    // POST /auth/login
    app.post('/login', async (request, reply) => {
        const { phone, password } = request.body as { phone?: string; password?: string };

        if (!phone || !password) {
            return reply.status(400).send({ error: 'Phone and password are required' });
        }

        const user = await getUserWithPassword(phone);
        if (!user || !user.passwordHash) {
            return reply.status(401).send({ error: 'Invalid credentials' });
        }

        const valid = verifyPassword(password, user.passwordHash);
        if (!valid) {
            return reply.status(401).send({ error: 'Invalid credentials' });
        }

        const token = await createSessionToken(user.id);
        await updateLastLogin(user.id);

        reply
            .setCookie('session_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 604800, // 7 days
            })
            .send({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                },
            });
    });

    // POST /auth/logout
    app.post('/logout', async (request, reply) => {
        const token = request.cookies?.session_token;
        if (token) {
            await deleteSessionToken(token);
        }

        reply
            .setCookie('session_token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 0,
            })
            .send({ success: true });
    });

    // GET /auth/me
    app.get('/me', async (request, reply) => {
        const session = request.session;
        if (!session.user) {
            return reply.status(401).send({
                user: null,
                tenant: null,
                role: 'owner',
                impersonating: false,
            });
        }

        reply.send(session);
    });
}
