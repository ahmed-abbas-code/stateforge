import { envSchema } from '@/types/validation/envSchema';
import { config } from '@/lib/config'; // assumes process.env was loaded here

export function validateEnvSchema(): void {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('[ENV VALIDATION FAILED]');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration. See logs above.');
  }

  console.log('[ENV VALIDATION PASSED]');
}
