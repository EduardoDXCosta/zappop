import type { FastifyInstance } from 'fastify';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import fastifyMultipart from '@fastify/multipart';

export async function uploadRoutes(app: FastifyInstance) {
    await app.register(fastifyMultipart, {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    });

    // POST /upload
    app.post('/', async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
        }

        const buffer = await data.toBuffer();
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch {
            // directory already exists
        }

        const fileName = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        reply.send({ url: `/uploads/${fileName}` });
    });
}
