'use client';

import type { AppointmentSlot } from '@/features/slots/types/slot';

type Props = {
  date: string;
  slots: AppointmentSlot[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
};

export function SlotPicker({ date, slots, loading, selectedId, onSelect }: Props) {
  if (!date) return null;
  return (
    <fieldset aria-required="true">
      <legend>
        Choose a time <span aria-hidden="true">*</span>
      </legend>
      {loading ? (
        <p className="hint" aria-live="polite">
          Loading times…
        </p>
      ) : slots.length === 0 ? (
        <p className="hint">No times are currently available for this date.</p>
      ) : (
        <div className="slot-grid">
          {slots.map((slot) => (
            <label className={`slot ${selectedId === slot.id ? 'selected' : ''}`} key={slot.id}>
              <input
                type="radio"
                name="slot"
                required
                checked={selectedId === slot.id}
                onChange={() => onSelect(slot.id)}
              />
              {new Intl.DateTimeFormat('en-ZA', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Africa/Johannesburg',
              }).format(new Date(slot.startsAt))}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
