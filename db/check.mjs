#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
    const envFile = await readFile(join(__dirname, '..', '.env.local'), 'utf8');
    for (const line of envFile.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq === -1) continue;
        const k = t.slice(0, eq).trim();
        let v = t.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
        }
        if (!process.env[k]) process.env[k] = v;
    }
} catch {}

const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
`;

console.log(`[check] ${tables.length} tables in public schema:`);
for (const row of tables) console.log('  -', row.table_name);

await sql.end({ timeout: 5 });
