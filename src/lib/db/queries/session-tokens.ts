import { sql } from '@/lib/db';
import type { SessionToken, User } from '@/lib/db/types';
import { randomUUID } from 'crypto';

type SessionTokenRow = {
    id: number;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
};

type SessionWithUserRow = SessionTokenRow & {
    uid: string;
    phone: string;
    uname: string;
    email: string | null;
    role: User['role'];
    tenantId: string | null;
    passwordHash: string | null;
    lastLogin: Date | null;
    ucreatedAt: Date;
};

function mapSessionToken(row: SessionTokenRow): SessionToken {
    return {
        id: row.id,
        userId: row.userId,
        token: row.token,
        expiresAt:
            row.expiresAt instanceof Date
                ? row.expiresAt.toISOString()
                : String(row.expiresAt),
        createdAt:
            row.createdAt instanceof Date
                ? row.createdAt.toISOString()
                : String(row.createdAt),
    };
}

export async function createSessionToken(userId: string): Promise<string> {
    const token = randomUUID();
    const rows = await sql<SessionTokenRow[]>`
        insert into session_tokens (user_id, token, expires_at)
        values (${userId}, ${token}, now() + interval '7 days')
        returning id, user_id as "userId", token, expires_at as "expiresAt", created_at as "createdAt"
    `;
    return rows[0].token;
}

export async function getSessionByToken(
    token: string
): Promise<SessionToken & { user: User } | null> {
    const rows = await sql<SessionWithUserRow[]>`
        select
            st.id,
            st.user_id      as "userId",
            st.token,
            st.expires_at   as "expiresAt",
            st.created_at   as "createdAt",
            u.id            as uid,
            u.phone,
            u.name          as uname,
            u.email,
            u.role,
            u.tenant_id     as "tenantId",
            u.password_hash as "passwordHash",
            u.last_login    as "lastLogin",
            u.created_at    as ucreatedAt
        from session_tokens st
        join users u on u.id = st.user_id
        where st.token = ${token} and st.expires_at > now()
    `;
    if (!rows[0]) return null;

    const r = rows[0];
    return {
        ...mapSessionToken(r),
        user: {
            id: r.uid,
            phone: r.phone,
            name: r.uname,
            email: r.email,
            role: r.role,
            tenantId: r.tenantId,
            passwordHash: r.passwordHash,
            lastLogin: r.lastLogin
                ? r.lastLogin instanceof Date
                    ? r.lastLogin.toISOString()
                    : String(r.lastLogin)
                : null,
            createdAt:
                r.ucreatedAt instanceof Date
                    ? r.ucreatedAt.toISOString()
                    : String(r.ucreatedAt),
        },
    };
}

export async function deleteSessionToken(token: string): Promise<void> {
    await sql`
        delete from session_tokens where token = ${token}
    `;
}

export async function deleteUserSessions(userId: string): Promise<void> {
    await sql`
        delete from session_tokens where user_id = ${userId}
    `;
}
