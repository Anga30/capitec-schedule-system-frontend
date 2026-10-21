'use client';

import { useEffect, useState } from 'react';

type Props = {
  availableDates: string[];
  loading: boolean;
  value: string;
  onChange: (date: string) => void;
};

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function AppointmentCalendar({ availableDates, loading, value, onChange }: Props) {
  const [month, setMonth] = useState<Date | null>(null);

  useEffect(() => {
    const today = new Date();
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  useEffect(() => {
    if (!month || availableDates.length === 0) return;
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const hasCurrentMonthDates = availableDates.some((date) => {
      const availableDate = new Date(`${date}T00:00:00`);
      return (
        availableDate.getFullYear() === currentMonth.getFullYear() &&
        availableDate.getMonth() === currentMonth.getMonth()
      );
    });
    if (!hasCurrentMonthDates) {
      const firstAvailableDate = new Date(`${availableDates[0]}T00:00:00`);
      if (firstAvailableDate > currentMonth)
        setMonth(new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1));
    }
  }, [availableDates, month]);

  if (!month)
    return (
      <div className="calendar-loading" aria-live="polite">
        Loading calendar…
      </div>
    );

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );
  const available = new Set(availableDates);
  const monthName = month.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const finalMonth = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const canGoNext = month < finalMonth;
  const canGoPrevious = month > currentMonth;
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const minimumDate = dateKey(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  return (
    <fieldset className="appointment-calendar">
      <legend aria-required="true">
        Choose an available date <span aria-hidden="true">*</span>
      </legend>
      {loading ? (
        <p className="calendar-loading" aria-live="polite">
          Checking available dates…
        </p>
      ) : (
        <>
          <div className="calendar-heading">
            <button
              type="button"
              className="calendar-nav"
              aria-label="Previous month"
              disabled={!canGoPrevious}
              onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
            >
              ‹
            </button>
            <span aria-live="polite">{monthName}</span>
            <button
              type="button"
              className="calendar-nav"
              aria-label="Next month"
              disabled={!canGoNext}
              onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
            >
              ›
            </button>
          </div>
          <div className="calendar-grid" role="grid" aria-label={monthName}>
            {weekdays.map((weekday) => (
              <span className="calendar-weekday" role="columnheader" key={weekday}>
                {weekday}
              </span>
            ))}
            {days.map((day, index) => {
              if (day === null)
                return <span className="calendar-empty" role="gridcell" key={`empty-${index}`} />;
              const key = dateKey(year, monthIndex, day);
              const isAvailable = available.has(key) && key >= minimumDate;
              return (
                <span role="gridcell" key={key}>
                  <button
                    type="button"
                    className={`calendar-day${isAvailable ? ' is-available' : ''}${value === key ? ' is-selected' : ''}`}
                    aria-label={`${isAvailable ? 'Available' : 'Unavailable'} ${key}`}
                    aria-pressed={value === key}
                    disabled={!isAvailable}
                    onClick={() => onChange(key)}
                  >
                    {day}
                    {isAvailable && <i aria-hidden="true" />}
                  </button>
                </span>
              );
            })}
          </div>
          {availableDates.length === 0 && (
            <p className="hint">No dates are currently available. Browse another month to check.</p>
          )}
          <div className="calendar-legend">
            <span>
              <i aria-hidden="true" /> Available
            </span>
            <span>
              <i className="is-unavailable" aria-hidden="true" /> Unavailable
            </span>
          </div>
        </>
      )}
    </fieldset>
  );
}
