export function auditLogger(event: string, userId?: string, meta: any = {}) {
  console.log(`[AUDIT] ${event}`, { userId, ...meta });
}
