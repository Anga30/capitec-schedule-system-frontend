import { useEffect, useState } from 'react';
import { ApiRequestError, apiGet } from '@/lib/api/client';
import { getBranches } from '@/features/branches/services/branches-api';
import { getDepartments } from '@/features/departments/services/departments-api';
import type { Department } from '@/features/departments/types/department';
import type { Branch } from '@/features/branches/types/branch';
import { getAvailableDates, getAvailableSlots } from '@/features/slots/services/slots-api';
import type { AppointmentSlot } from '@/features/slots/types/slot';

export function useBookingOptions() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState('');
  const reportError = (cause: unknown, fallback: string) => {
    setError(cause instanceof Error ? cause.message : fallback);
    setTicketId(cause instanceof ApiRequestError ? cause.ticketId : '');
  };

  useEffect(() => {
    let active = true;
    let healthUnavailable = false;
    const checkHealth = async () => {
      try {
        await apiGet<{ status: string }>('/health');
        if (active && healthUnavailable) {
          healthUnavailable = false;
          setError('');
          setTicketId('');
        }
      } catch (cause: unknown) {
        if (!active) return;
        if (!healthUnavailable) {
          setError(cause instanceof Error ? cause.message : 'Our service is temporarily unavailable. Please try again shortly.');
          setTicketId(cause instanceof ApiRequestError ? cause.ticketId : '');
        }
        healthUnavailable = true;
      }
    };
    void checkHealth();
    const healthTimer = window.setInterval(() => { void checkHealth(); }, 10000);
    getDepartments().then((items) => { if (active) setDepartments(items); }).catch((cause: unknown) => {
      if (active) reportError(cause, 'Departments are temporarily unavailable.');
    });
    return () => { active = false; window.clearInterval(healthTimer); };
  }, []);

  useEffect(() => {
    let active = true;
    getBranches().then((items) => {
      if (!active) return;
      setBranches(items);
      if (items[0]) setBranchId(items[0].id);
    }).catch((cause: unknown) => {
      if (active) reportError(cause, 'Branches are temporarily unavailable.');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setAvailableDates([]);
    setDate('');
    setAvailabilityLoading(Boolean(branchId));
    if (!branchId) return () => { active = false; };
    getAvailableDates(branchId).then((items) => {
      if (!active) return;
      setAvailableDates(items);
      setDate((selectedDate) => items.includes(selectedDate) ? selectedDate : '');
    }).catch((cause: unknown) => {
      if (active) reportError(cause, 'Could not load available dates.');
    }).finally(() => {
      if (active) setAvailabilityLoading(false);
    });
    return () => { active = false; };
  }, [branchId]);

  useEffect(() => {
    let active = true;
    setSlots([]);
    setSlotsLoading(Boolean(branchId && date));
    if (!branchId || !date) return () => { active = false; };
    getAvailableSlots(branchId, date).then((items) => {
      if (active) setSlots(items);
    }).catch((cause: unknown) => {
      if (active) reportError(cause, 'Could not load available times.');
    }).finally(() => {
      if (active) setSlotsLoading(false);
    });
    return () => { active = false; };
  }, [branchId, date]);

  return { branches, departments, slots, setSlots, slotsLoading, branchId, setBranchId, date, setDate, availableDates, availabilityLoading, error, setError, ticketId, setTicketId };
}
