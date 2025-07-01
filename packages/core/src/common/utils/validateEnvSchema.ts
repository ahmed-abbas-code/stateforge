import { envSchema } from '../types/validation/envSchema';
import { getFrameworkConfig } from './configStore';

export function validateEnvSchema(): void {
  const config = getFrameworkConfig();
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('[ENV VALIDATION FAILED]');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration. See logs above.');
  }

  console.log('[ENV VALIDATION PASSED]');
}
