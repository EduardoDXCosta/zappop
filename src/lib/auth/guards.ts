import { getSessionContext } from './session';
import type { SessionContext } from './session';

/**
 * Check if the current session is an admin.
 * Use in API routes to protect admin-only endpoints.
 */
export async function isAdmin(
    impersonateTenantId?: string | null
): Promise<{ authorized: boolean; session: SessionContext }> {
    const session = await getSessionContext(impersonateTenantId);
    return { authorized: session.role === 'admin', session };
}
