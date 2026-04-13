import postgres from 'postgres';

declare global {
    // eslint-disable-next-line no-var
    var __pgClient: ReturnType<typeof postgres> | undefined;
}

function createClient(): ReturnType<typeof postgres> {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            'DATABASE_URL is not set. Copy .env.local.example to .env.local and fill it in.'
        );
    }
    return postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: true,
    });
}

function getClient(): ReturnType<typeof postgres> {
    if (!global.__pgClient) {
        global.__pgClient = createClient();
    }
    return global.__pgClient;
}

export const sql = new Proxy({} as ReturnType<typeof postgres>, {
    get(_target, prop: string | symbol) {
        const client = getClient();
        const value = Reflect.get(client, prop, client);
        return typeof value === 'function' ? (value as Function).bind(client) : value;
    },
});
