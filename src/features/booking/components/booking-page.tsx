'use client';

import { useState, type FormEvent } from 'react';
import { BranchSelector } from './branch-selector';
import { DepartmentSelector } from '@/features/departments/components/department-selector';
import { SlotPicker } from './slot-picker';
import { BookingConfirmationView } from './booking-confirmation';
import { AppointmentCalendar } from './appointment-calendar';
import { ErrorModal } from './error-modal';
import { useBookingOptions } from '../hooks/use-booking-options';
import { createBooking } from '../services/bookings-api';
import { bookingInputSchema, type BookingConfirmation } from '../types/booking';
import { ApiHttpError, ApiRequestError } from '@/lib/api/client';

export default function BookingPage() {
  const {
    branches,
    departments,
    slots,
    setSlots,
    slotsLoading,
    branchId,
    setBranchId,
    date,
    setDate,
    availableDates,
    availabilityLoading,
    error,
    setError,
    ticketId,
    setTicketId,
  } = useBookingOptions();
  const [slotId, setSlotId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isCapitecClient, setIsCapitecClient] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setTicketId('');
    if (!branchId) {
      setError('Choose a branch.');
      return;
    }
    if (!date) {
      setError('Choose an available date.');
      return;
    }
    const input = bookingInputSchema.safeParse({
      slotId,
      departmentId,
      customerName: name,
      customerEmail: email,
      isCapitecClient,
    });
    if (!input.success) {
      setError(input.error.issues[0]?.message ?? 'Check your booking details and try again.');
      return;
    }

    setLoading(true);
    try {
      setConfirmation(await createBooking(input.data));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Booking failed.');
      setTicketId(cause instanceof ApiRequestError ? cause.ticketId : '');
      if (cause instanceof ApiHttpError && cause.status === 409 && slotId) {
        setSlots((current) => current.filter((slot) => slot.id !== slotId));
      }
      setSlotId('');
    } finally {
      setLoading(false);
    }
  }

  if (confirmation) {
    return (
      <BookingConfirmationView
        confirmation={confirmation}
        firstName={name.split(' ')[0]}
        onBookAgain={() => {
          setConfirmation(null);
          setName('');
          setEmail('');
          setSlotId('');
        }}
      />
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span>Branch booking</span>
        </div>
        <span className="secure-label">Appointments made simple</span>
      </header>
      <section className="intro">
        <p className="eyebrow">Here when you need us</p>
        <h1>
          Make time for
          <br />
          <span>what matters.</span>
        </h1>
        <p>Choose a branch and a time that works for you. We’ll take it from there.</p>
      </section>
      <form className="card booking-form" onSubmit={submit} noValidate>
        <div className="form-heading">
          <div>
            <p className="eyebrow">Let’s get you booked</p>
            <h2>Appointment details</h2>
          </div>
          <span className="step">
            1 <i>of</i> 1
          </span>
        </div>
        <BranchSelector
          branches={branches}
          value={branchId}
          onChange={(value) => {
            setBranchId(value);
            setDate('');
            setSlotId('');
          }}
        />
        <DepartmentSelector
          departments={departments}
          value={departmentId}
          onChange={setDepartmentId}
        />
        <AppointmentCalendar
          availableDates={availableDates}
          loading={availabilityLoading}
          value={date}
          onChange={(value) => {
            setDate(value);
            setSlotId('');
          }}
        />
        <SlotPicker
          date={date}
          slots={slots}
          loading={slotsLoading}
          selectedId={slotId}
          onSelect={setSlotId}
        />
        <div className="divider" />
        <p className="section-label">Your contact details</p>
        <label>
          Full name <span aria-hidden="true">*</span>
          <input
            suppressHydrationWarning
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Alex Morgan"
          />
        </label>
        <label>
          Email address <span aria-hidden="true">*</span>
          <input
            suppressHydrationWarning
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <fieldset className="client-question">
          <legend>
            Are you a Capitec client? <span aria-hidden="true">*</span>
          </legend>
          <label>
            <input
              required
              type="radio"
              name="isCapitecClient"
              value="yes"
              checked={isCapitecClient === true}
              onChange={() => setIsCapitecClient(true)}
            />{' '}
            Yes
          </label>
          <label>
            <input
              required
              type="radio"
              name="isCapitecClient"
              value="no"
              checked={isCapitecClient === false}
              onChange={() => setIsCapitecClient(false)}
            />{' '}
            No
          </label>
        </fieldset>
        <button className="primary" type="submit" disabled={loading || !slotId}>
          {loading ? 'Confirming…' : 'Confirm appointment'}
          <span>→</span>
        </button>
        <p className="fine-print">A confirmation email will be simulated for this assessment.</p>
      </form>
      <ErrorModal
        message={error}
        ticketId={ticketId}
        onClose={() => {
          setError('');
          setTicketId('');
        }}
      />
      <footer>Appointment times are shown in South African local time.</footer>
    </main>
  );
}
