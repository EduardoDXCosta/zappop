import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { authPlugin } from './plugins/auth.js';
import { errorHandler } from './plugins/error-handler.js';

// Route imports
import { authRoutes } from './routes/auth.js';
import { webhookRoutes } from './routes/webhook.js';
import { menuRoutes } from './routes/menu.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { adminRoutes } from './routes/admin.js';
import { evolutionRoutes } from './routes/evolution.js';
import { globalProductsRoutes } from './routes/global-products.js';
import { setupRoutes } from './routes/setup.js';
import { takeoverRoutes } from './routes/takeover.js';
import { testChatRoutes } from './routes/test-chat.js';
import { cronRoutes } from './routes/cron.js';
import { uploadRoutes } from './routes/upload.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

async function start() {
    const app = Fastify({
        logger: {
            level: process.env.LOG_LEVEL || 'info',
        },
    });

    // Global error handler
    app.setErrorHandler(errorHandler);

    // CORS
    await app.register(cors, {
        origin: CORS_ORIGIN.split(',').map((s) => s.trim()),
        credentials: true,
    });

    // Cookie parsing
    await app.register(cookie);

    // Auth plugin (decorates request with session)
    await app.register(authPlugin);

    // Health check
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    const API_PREFIX = process.env.API_PREFIX || '';

    // Register route groups
    await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
    await app.register(webhookRoutes, { prefix: `${API_PREFIX}/webhook` });
    await app.register(menuRoutes, { prefix: `${API_PREFIX}/menu` });
    await app.register(onboardingRoutes, { prefix: `${API_PREFIX}/onboarding` });
    await app.register(adminRoutes, { prefix: `${API_PREFIX}/admin` });
    await app.register(evolutionRoutes, { prefix: `${API_PREFIX}/evolution` });
    await app.register(globalProductsRoutes, { prefix: `${API_PREFIX}/global-products` });
    await app.register(setupRoutes, { prefix: `${API_PREFIX}/setup-admin` });
    await app.register(takeoverRoutes, { prefix: `${API_PREFIX}/takeover` });
    await app.register(testChatRoutes, { prefix: `${API_PREFIX}/test-chat` });
    await app.register(cronRoutes, { prefix: `${API_PREFIX}/cron` });
    await app.register(uploadRoutes, { prefix: `${API_PREFIX}/upload` });

    await app.listen({ port: PORT, host: HOST });
    app.log.info(`WhatsMenu API running on http://${HOST}:${PORT}`);
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
