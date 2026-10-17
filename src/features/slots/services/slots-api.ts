import { apiGet } from '@/lib/api/client';
import { appointmentSlotsSchema, availableDatesSchema } from '../types/slot';

export function getAvailableDates(branchId: string) {
  return apiGet<unknown>(`/api/slots/available-dates?${new URLSearchParams({ branchId })}`).then(availableDatesSchema.parse);
}

export function getAvailableSlots(branchId: string, date: string) {
  return apiGet<unknown>(`/api/slots?${new URLSearchParams({ branchId, date })}`).then(appointmentSlotsSchema.parse);
}
