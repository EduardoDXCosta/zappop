import postgres from 'postgres';

declare global {
    // eslint-disable-next-line no-var
    var __pgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        'DATABASE_URL is not set. Set it in your .env file.'
    );
}

export const sql =
    global.__pgClient ??
    postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: true,
    });

if (process.env.NODE_ENV !== 'production') {
    global.__pgClient = sql;
}
