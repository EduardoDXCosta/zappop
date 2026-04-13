import { NextRequest, NextResponse } from 'next/server';
import { getUserWithPassword, updateLastLogin } from '@/lib/db/queries/users';
import { createSessionToken } from '@/lib/db/queries/session-tokens';
import { verifyPassword } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { phone, password } = body as { phone?: string; password?: string };

    if (!phone || !password) {
        return NextResponse.json(
            { error: 'Phone and password are required' },
            { status: 400 }
        );
    }

    const user = await getUserWithPassword(phone);
    if (!user || !user.passwordHash) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    }

    const token = await createSessionToken(user.id);
    await updateLastLogin(user.id);

    const response = NextResponse.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
        },
    });

    response.cookies.set(
        'session_token',
        token,
        {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 604800,
        }
    );

    return response;
}
