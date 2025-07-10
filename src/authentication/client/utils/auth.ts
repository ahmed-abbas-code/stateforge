// src/authentication/client/utils/auth.ts

import Cookies from 'js-cookie';

/**
 * Read the JWT or session token from your httpOnly cookie
 * (or from localStorage if you went that route).
 */
export function getAuthToken(): string | null {
  return Cookies.get('AUTH_TOKEN') ?? null;
}

/**
 * Read the tenant identifier from storage as well.
 */
export function getTenantId(): string | null {
  return Cookies.get('TENANT_ID') ?? null;
}
