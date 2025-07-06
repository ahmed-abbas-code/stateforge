// packages/shared/utils/validateSchema.ts

import { ZodSchema, ZodError } from 'zod';

type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ZodError;
};

export function validateSchema<T>(schema: ZodSchema<T>, data: unknown, label?: string): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    if (label) {
      console.warn(`[Zod Validation Failed] ${label}:`, result.error.flatten());
    }
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}
