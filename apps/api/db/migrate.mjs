#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

async function loadEnv() {
    try {
        const envFile = await readFile(join(__dirname, '..', '.env.local'), 'utf8');
        for (const line of envFile.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eq = trimmed.indexOf('=');
            if (eq === -1) continue;
            const key = trimmed.slice(0, eq).trim();
            let value = trimmed.slice(eq + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            if (!process.env[key]) process.env[key] = value;
        }
    } catch {
        // .env.local not present — rely on real env
    }
}

await loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('[migrate] DATABASE_URL is not set. Create .env.local.');
    process.exit(1);
}

const sql = postgres(connectionString, { max: 1, onnotice: () => {} });

async function ensureMigrationsTable() {
    await sql`
        create table if not exists schema_migrations (
            name        text primary key,
            applied_at  timestamptz not null default now()
        )
    `;
}

async function appliedSet() {
    const rows = await sql`select name from schema_migrations`;
    return new Set(rows.map((r) => r.name));
}

async function run() {
    await ensureMigrationsTable();
    const applied = await appliedSet();

    const files = (await readdir(MIGRATIONS_DIR))
        .filter((f) => f.endsWith('.sql'))
        .sort();

    if (files.length === 0) {
        console.log('[migrate] no migration files found');
        return;
    }

    for (const file of files) {
        if (applied.has(file)) {
            console.log(`[migrate] skip  ${file} (already applied)`);
            continue;
        }
        const sqlText = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
        console.log(`[migrate] apply ${file}`);
        try {
            await sql.unsafe(sqlText);
            await sql`insert into schema_migrations (name) values (${file})`;
            console.log(`[migrate] done  ${file}`);
        } catch (err) {
            console.error(`[migrate] fail  ${file}`);
            console.error(err);
            process.exit(1);
        }
    }
}

try {
    await run();
} finally {
    await sql.end({ timeout: 5 });
}
