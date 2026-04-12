import { sql } from '@/lib/db';
import type { User } from '@/lib/db/types';

type UserRow = {
    id: string;
    phone: string;
    name: string;
    email: string | null;
    role: User['role'];
    tenantId: string | null;
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
    tenant_id  as "tenantId",
    created_at as "createdAt"
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
