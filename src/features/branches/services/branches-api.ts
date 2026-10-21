import { apiGet } from '@/lib/api/client';
import { branchesSchema } from '../types/branch';
export async function getBranches() {
  return branchesSchema.parse(await apiGet<unknown>('/api/branches'));
}
