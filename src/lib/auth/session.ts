import { cookies } from 'next/headers';
import { getSessionByToken } from '@/lib/db/queries/session-tokens';
import { getUserById } from '@/lib/db/queries/users';
import { getTenantById } from '@/lib/db/queries/tenants';
import type { User, Tenant, UserRole } from '@/lib/db/types';

export interface SessionContext {
    user: User | null;
    tenant: Tenant | null;
    role: UserRole;
    impersonating: boolean;
}

export async function getSessionContext(
    impersonateTenantId?: string | null
): Promise<SessionContext> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
        return { user: null, tenant: null, role: 'owner', impersonating: false };
    }

    const session = await getSessionByToken(token);
    if (!session) {
        return { user: null, tenant: null, role: 'owner', impersonating: false };
    }

    const user = await getUserById(session.userId);
    if (!user) {
        return { user: null, tenant: null, role: 'owner', impersonating: false };
    }

    if (user.role === 'admin') {
        if (impersonateTenantId) {
            const tenant = await getTenantById(impersonateTenantId);
            if (tenant) {
                return { user, tenant, role: 'admin', impersonating: true };
            }
        }
        return { user, tenant: null, role: 'admin', impersonating: false };
    }

    const tenant = user.tenantId
        ? await getTenantById(user.tenantId)
        : null;

    return { user, tenant, role: 'owner', impersonating: false };
}
