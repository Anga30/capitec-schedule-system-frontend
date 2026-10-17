import { apiGet } from '@/lib/api/client';
import { departmentsSchema } from '../types/department';
export async function getDepartments() {
  return departmentsSchema.parse(await apiGet<unknown>('/api/departments'));
}
