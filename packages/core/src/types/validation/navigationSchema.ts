import { z } from 'zod';

export const navigationStateSchema = z.object({
  currentStep: z.number().min(0),
  completed: z.boolean(),
});

export type NavigationState = z.infer<typeof navigationStateSchema>;
