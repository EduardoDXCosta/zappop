import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(
    error: FastifyError,
    _request: FastifyRequest,
    reply: FastifyReply,
) {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
        _request.log.error(error);
    }

    reply.status(statusCode).send({
        error: statusCode >= 500 ? 'Internal server error' : error.message,
        code: error.code ?? 'UNKNOWN',
    });
}
