import { z } from 'zod';

export const bookingInputSchema = z.object({
  slotId: z.uuid('Choose an appointment time.'),
  departmentId: z.string().uuid('Choose a department.'),
  customerName: z.string().trim().min(2, 'Enter your full name.').max(100, 'Name must be 100 characters or fewer.'),
  customerEmail: z.email('Enter a valid email address.').max(254, 'Email must be 254 characters or fewer.'),
  isCapitecClient: z.boolean({ error: 'Tell us whether you are a Capitec client.' }),
});

export const bookingConfirmationSchema = z.object({
  booking: z.object({
    id: z.string().uuid(),
    branchName: z.string().min(1),
    branchAddress: z.string().min(1),
    departmentName: z.string().min(1),
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
  }),
  message: z.string().min(1),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
export type BookingConfirmation = z.infer<typeof bookingConfirmationSchema>;
