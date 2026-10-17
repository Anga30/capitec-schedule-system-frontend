import { apiPost } from '@/lib/api/client';
import { bookingConfirmationSchema, bookingInputSchema, type BookingInput } from '../types/booking';
export async function createBooking(input: BookingInput) {
  const validatedInput = bookingInputSchema.parse(input);
  return bookingConfirmationSchema.parse(await apiPost<unknown>('/api/bookings', validatedInput));
}
