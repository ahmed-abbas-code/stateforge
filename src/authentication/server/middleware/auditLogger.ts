// src/authentication/server/middleware/auditLogger.ts

export const auditLoginEvent = (userId: string) => {
  console.log(`[LOGIN] user: ${userId} at ${new Date().toISOString()}`);
};

export const auditLogoutEvent = (userId: string) => {
  console.log(`[LOGOUT] user: ${userId} at ${new Date().toISOString()}`);
};
