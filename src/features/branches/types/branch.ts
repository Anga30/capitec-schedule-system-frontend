import { z } from 'zod';

export const branchSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
});

export const branchesSchema = z.array(branchSchema);

export type Branch = z.infer<typeof branchSchema>;
