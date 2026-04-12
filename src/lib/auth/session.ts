import { getUserByPhone } from '@/lib/db/queries/users';
import {
    getDefaultTenantForApp,
    getTenantById,
} from '@/lib/db/queries/tenants';
import type { User, Tenant, UserRole } from '@/lib/db/types';

export interface SessionContext {
    user: User | null;
    tenant: Tenant | null;
    role: UserRole;
    /** When an admin is impersonating a tenant, this is true */
    impersonating: boolean;
}

/**
 * Resolve the current session context.
 *
 * Until real auth is implemented this uses env vars:
 *  - APP_ADMIN_PHONE → admin user
 *  - APP_DEFAULT_TENANT_SLUG → owner fallback
 *
 * Impersonation: pass a tenantId to view the dashboard as that tenant.
 * Only admins can impersonate.
 */
export async function getSessionContext(
    impersonateTenantId?: string | null
): Promise<SessionContext> {
    // 1. Check if an admin phone is configured
    const adminPhone = process.env.APP_ADMIN_PHONE?.trim();
    if (adminPhone) {
        const user = await getUserByPhone(adminPhone);
        if (user && user.role === 'admin') {
            // Admin impersonating a specific tenant
            if (impersonateTenantId) {
                const tenant = await getTenantById(impersonateTenantId);
                if (tenant) {
                    return {
                        user,
                        tenant,
                        role: 'admin',
                        impersonating: true,
                    };
                }
            }
            return { user, tenant: null, role: 'admin', impersonating: false };
        }
    }

    // 2. Fallback: resolve tenant and treat as owner
    const tenant = await getDefaultTenantForApp();
    if (!tenant) {
        return { user: null, tenant: null, role: 'owner', impersonating: false };
    }

    // Try to find owner user linked to this tenant
    const ownerPhone = tenant.whatsappAdminNumber;
    let user: User | null = null;
    if (ownerPhone) {
        user = await getUserByPhone(ownerPhone);
    }

    return { user, tenant, role: 'owner', impersonating: false };
}
