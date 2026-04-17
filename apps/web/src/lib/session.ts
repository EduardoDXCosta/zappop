import { cookies } from 'next/headers';
import { api } from './api-client';
import type { SessionContext } from '@whatsmenu/shared';

/**
 * Server-side helper to fetch the current session from the backend API.
 * Forwards the session_token cookie from the browser to the API.
 */
export async function getSession(): Promise<SessionContext> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
        return { user: null, tenant: null, role: 'owner', impersonating: false };
    }

    try {
        return await api.get<SessionContext>('/auth/me', {
            headers: {
                Cookie: `session_token=${sessionToken}`,
            },
        });
    } catch {
        return { user: null, tenant: null, role: 'owner', impersonating: false };
    }
}
