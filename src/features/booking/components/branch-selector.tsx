'use client';

import type { Branch } from '@/features/branches/types/branch';

type Props = { branches: Branch[]; value: string; onChange: (value: string) => void };

export function BranchSelector({ branches, value, onChange }: Props) {
  return (
    <label>
      Choose a branch <span aria-hidden="true">*</span>
      <select
        suppressHydrationWarning
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          Select a branch
        </option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name} — {branch.address}
          </option>
        ))}
      </select>
    </label>
  );
}
