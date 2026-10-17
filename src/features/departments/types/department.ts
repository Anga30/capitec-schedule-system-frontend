import { z } from 'zod';
export const departmentSchema = z.object({ id: z.string().uuid(), name: z.string().min(1) });
export const departmentsSchema = z.array(departmentSchema);
export type Department = z.infer<typeof departmentSchema>;
