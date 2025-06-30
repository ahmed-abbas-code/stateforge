export function auditLogger(event: string, userId?: string, meta: Record<string, unknown> = {}) {
  console.log(`[AUDIT] ${event}`, { userId, ...meta });
}
