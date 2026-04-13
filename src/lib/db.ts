import postgres from 'postgres';

declare global {
    // eslint-disable-next-line no-var
    var __pgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error(
        'DATABASE_URL is not set. Copy .env.local.example to .env.local and fill it in.'
    );
}

export const sql =
    global.__pgClient ??
    postgres(connectionString ?? 'postgres://placeholder:5432/placeholder', {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: true,
    });

if (process.env.NODE_ENV !== 'production') {
    global.__pgClient = sql;
}
