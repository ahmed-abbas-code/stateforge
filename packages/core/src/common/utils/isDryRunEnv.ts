export const isDryRunEnv =
  process.env.NEXT_PUBLIC_ENV === 'dummy' ||
  process.env.NEXT_PUBLIC_AUTH_STRATEGY === 'dummy';
