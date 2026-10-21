'use client';

import type { BookingConfirmation } from '@/features/booking/types/booking';

type Props = { confirmation: BookingConfirmation; firstName: string; onBookAgain: () => void };

export function BookingConfirmationView({ confirmation, firstName, onBookAgain }: Props) {
  const { booking } = confirmation;
  const date = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(booking.startsAt));
  const time = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  return (
    <main className="page">
      <section className="card success" aria-live="polite">
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>
        <p className="eyebrow">Appointment confirmed</p>
        <h1>You’re all set, {firstName}.</h1>
        <p>{confirmation.message}</p>
        <p>
          {booking.branchName}
          <br />
          {booking.branchAddress}
          <br />
          {booking.departmentName}
          <br />
          {date}
          <br />
          {time.format(new Date(booking.startsAt))}–{time.format(new Date(booking.endsAt))} (South
          African time)
        </p>
        <p className="reference">
          Reference: <strong>{confirmation.booking.id}</strong>
        </p>
        <button className="secondary" onClick={onBookAgain}>
          Book another appointment
        </button>
      </section>
    </main>
  );
}
