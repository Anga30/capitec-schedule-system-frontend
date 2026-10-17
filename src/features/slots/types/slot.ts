import { z } from 'zod';

export const appointmentSlotSchema = z.object({
  id: z.uuid(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});

export const appointmentSlotsSchema = z.array(appointmentSlotSchema);
export const availableDatesSchema = z.array(z.iso.date());

export type AppointmentSlot = z.infer<typeof appointmentSlotSchema>;
