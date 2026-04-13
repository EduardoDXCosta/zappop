import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionByToken } from '@/lib/db/queries/session-tokens';

export const dynamic = 'force-dynamic';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const session = await getSessionByToken(token);
    if (!session) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
        user: {
            id: session.user.id,
            name: session.user.name,
            phone: session.user.phone,
            role: session.user.role,
        },
    });
}
