import type { FastifyInstance } from 'fastify';
import { sql } from '../db/connection.js';
import { adminExists, createUser } from '../db/queries/index.js';
import { hashPassword } from '../lib/auth/password.js';
import { createSessionToken } from '../db/queries/session-tokens.js';
import { updateLastLogin } from '../db/queries/users.js';

export async function setupRoutes(app: FastifyInstance) {
    // GET /setup-admin/check
    app.get('/check', async (_request, reply) => {
        const exists = await adminExists();
        reply.send({ exists });
    });

    // POST /setup-admin
    app.post('/', async (request, reply) => {
        const hasAdmin = await adminExists();
        if (hasAdmin) {
            return reply.status(403).send({ error: 'Já existe um administrador cadastrado' });
        }

        const { name, phone, password } = request.body as {
            name?: string;
            phone?: string;
            password?: string;
        };

        if (!name || !phone || !password) {
            return reply.status(400).send({ error: 'Nome, telefone e senha são obrigatórios' });
        }

        if (password.length < 6) {
            return reply.status(400).send({ error: 'A senha deve ter pelo menos 6 caracteres' });
        }

        const digits = phone.replace(/\D/g, '');
        if (digits.length < 10) {
            return reply.status(400).send({ error: 'Telefone inválido' });
        }

        const passwordHash = hashPassword(password);
        const user = await createUser({ phone: digits, name, role: 'admin' });
        await sql`update users set password_hash = ${passwordHash} where id = ${user.id}`;

        const token = await createSessionToken(user.id);
        await updateLastLogin(user.id);

        reply
            .setCookie('session_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 604800,
            })
            .send({
                success: true,
                user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
            });
    });
}
