'use client';
import type { Department } from '../types/department';
type Props = { departments: Department[]; value: string; onChange: (value: string) => void };
export function DepartmentSelector({ departments, value, onChange }: Props) {
  return <label>Choose a department <span aria-hidden="true">*</span>
    <select suppressHydrationWarning required value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="" disabled>Select a department</option>
      {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
    </select>
  </label>;
}
