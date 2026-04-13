import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSessionToken } from '@/lib/db/queries/session-tokens';

export const dynamic = 'force-dynamic';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
        await deleteSessionToken(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('session_token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return response;
}
