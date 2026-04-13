import { sql } from '@/lib/db';

export async function adminExists(): Promise<boolean> {
    const rows = await sql<{ count: string }[]>`
        select count(*)::text as count from users where role = 'admin'
    `;
    return Number(rows[0].count) > 0;
}
