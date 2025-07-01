import { z } from 'zod';

export const appStateSchema = z.object({
  theme: z.enum(['light', 'dark']),
  language: z.string().min(2),
  sidebarOpen: z.boolean(),
});

export type AppState = z.infer<typeof appStateSchema>;
