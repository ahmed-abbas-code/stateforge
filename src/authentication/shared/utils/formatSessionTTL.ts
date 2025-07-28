// src/authentication/shared/utils/formatSessionTTL.ts

export function formatSessionTTL(expiresAt?: number): string {
  if (!expiresAt) return 'unknown';

  const now = Date.now();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) return 'expired';

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`); 
  // only show seconds if <1h

  return parts.join(' ') + ` (until ${new Date(expiresAt).toLocaleString()})`;
}
