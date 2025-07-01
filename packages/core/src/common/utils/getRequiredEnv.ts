export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Env] Missing required environment variable: ${name}`);
  }
  return value;
}
