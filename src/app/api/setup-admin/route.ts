import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { adminExists, createUser } from '@/lib/db/queries';
import { hashPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/db/queries/session-tokens';
import { updateLastLogin } from '@/lib/db/queries/users';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const hasAdmin = await adminExists();
    if (hasAdmin) {
        return NextResponse.json(
            { error: 'Já existe um administrador cadastrado' },
            { status: 403 }
        );
    }

    const body = await request.json();
    const { name, phone, password } = body;

    if (!name || !phone || !password) {
        return NextResponse.json(
            { error: 'Nome, telefone e senha são obrigatórios' },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { error: 'A senha deve ter pelo menos 6 caracteres' },
            { status: 400 }
        );
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
        return NextResponse.json(
            { error: 'Telefone inválido' },
            { status: 400 }
        );
    }

    const passwordHash = hashPassword(password);

    const user = await createUser({
        phone: digits,
        name,
        role: 'admin',
    });

    await sql`update users set password_hash = ${passwordHash} where id = ${user.id}`;

    const token = await createSessionToken(user.id);
    await updateLastLogin(user.id);

    const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });

    response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });

    return response;
}
