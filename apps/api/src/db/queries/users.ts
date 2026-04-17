import { sql } from '../connection.js';
import type { User } from '../types.js';

type UserRow = {
    id: string;
    phone: string;
    name: string;
    email: string | null;
    role: User['role'];
    tenantId: string | null;
    passwordHash: string | null;
    lastLogin: Date | null;
    createdAt: Date;
};

function mapUser(row: UserRow): User {
    return {
        id: row.id,
        phone: row.phone,
        name: row.name,
        email: row.email,
        role: row.role,
        tenantId: row.tenantId,
        passwordHash: row.passwordHash,
        lastLogin: row.lastLogin
            ? row.lastLogin instanceof Date
                ? row.lastLogin.toISOString()
                : String(row.lastLogin)
            : null,
        createdAt:
            row.createdAt instanceof Date
                ? row.createdAt.toISOString()
                : String(row.createdAt),
    };
}

const userSelect = sql`
    id,
    phone,
    name,
    email,
    role,
    tenant_id     as "tenantId",
    password_hash as "passwordHash",
    last_login    as "lastLogin",
    created_at    as "createdAt"
`;

export async function getUserById(id: string): Promise<User | null> {
    const rows = await sql<UserRow[]>`
        select ${userSelect} from users where id = ${id} limit 1
    `;
    return rows[0] ? mapUser(rows[0]) : null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
    const rows = await sql<UserRow[]>`
        select ${userSelect} from users where phone = ${phone} limit 1
    `;
    return rows[0] ? mapUser(rows[0]) : null;
}

export async function getAllUsers(): Promise<User[]> {
    const rows = await sql<UserRow[]>`
        select ${userSelect} from users order by created_at desc
    `;
    return rows.map(mapUser);
}

export async function getUserWithPassword(phone: string): Promise<User | null> {
    const rows = await sql<UserRow[]>`
        select ${userSelect} from users where phone = ${phone} limit 1
    `;
    return rows[0] ? mapUser(rows[0]) : null;
}

export async function updateLastLogin(userId: string): Promise<void> {
    await sql`
        update users set last_login = now() where id = ${userId}
    `;
}

export async function createUser(input: {
    phone: string;
    name: string;
    email?: string;
    role?: User['role'];
    tenantId?: string;
}): Promise<User> {
    const rows = await sql<UserRow[]>`
        insert into users (phone, name, email, role, tenant_id)
        values (
            ${input.phone},
            ${input.name},
            ${input.email ?? null},
            ${input.role ?? 'owner'},
            ${input.tenantId ?? null}
        )
        returning ${userSelect}
    `;
    return mapUser(rows[0]);
}
