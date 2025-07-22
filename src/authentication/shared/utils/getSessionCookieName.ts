// src/authentication/shared/utils/getSessionCookieName.ts

/**
 * Generate a cookie name for a provider instance.
 * Example: sf.jwt.dunnixer-session
 */
export function getSessionCookieName(type: string, instanceId: string): string {
  return `sf.${type}.${instanceId}-session`;
}
