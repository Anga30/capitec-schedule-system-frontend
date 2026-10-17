import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BookingPage from './booking-page';

const fetchMock = jest.fn<typeof fetch>();

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  fetchMock.mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.endsWith('/health')) return jsonResponse({ status: 'ok' });
    if (url.includes('/api/departments')) return jsonResponse([{ id: '20000000-0000-4000-8000-000000000001', name: 'Everyday Banking' }]);
    if (url.includes('/api/branches')) {
      return jsonResponse([{ id: '10000000-0000-4000-8000-000000000001', name: 'Cape Town CBD', address: '12 Adderley Street' }]);
    }
    if (url.includes('/api/slots/available-dates')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return jsonResponse([`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`]);
    }
    if (url.includes('/api/slots')) {
      return jsonResponse([{ id: '30000000-0000-4000-8000-000000000001', startsAt: '2027-01-01T07:30:00.000Z', endsAt: '2027-01-01T08:00:00.000Z' }]);
    }
    if (url.includes('/api/bookings') && init?.method === 'POST') {
      return jsonResponse({ booking: { id: '40000000-0000-4000-8000-000000000001', branchName: 'Cape Town CBD', branchAddress: '12 Adderley Street', departmentName: 'Everyday Banking', startsAt: '2027-01-01T07:30:00.000Z', endsAt: '2027-01-01T08:00:00.000Z' }, message: 'Your appointment is confirmed.' });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('BookingPage', () => {
  it('loads branches and slots, submits a booking, and shows its confirmation', async () => {
    render(<BookingPage />);

    await waitFor(() => expect(screen.getByRole('combobox', { name: /Choose a branch/ })).toHaveValue('10000000-0000-4000-8000-000000000001'));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const selectedDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    fireEvent.click(await screen.findByRole('button', { name: `Available ${selectedDate}` }));
    const slot = await screen.findByRole('radio', { name: '09:30' });
    fireEvent.click(slot);
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Choose a department/ }), { target: { value: '20000000-0000-4000-8000-000000000001' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Yes' }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm appointment/ }));

    expect(await screen.findByRole('heading', { name: 'You’re all set, Alex.' })).toBeInTheDocument();
    expect(screen.getByText('40000000-0000-4000-8000-000000000001')).toBeInTheDocument();

    await waitFor(() => {
      const [url, options] = fetchMock.mock.calls.find(([requestUrl, requestOptions]) =>
        String(requestUrl).includes('/api/bookings') && requestOptions?.method === 'POST',
      ) ?? [];
      expect(url).toContain('/api/bookings');
      expect(JSON.parse(options?.body as string)).toEqual({
        slotId: '30000000-0000-4000-8000-000000000001',
        departmentId: '20000000-0000-4000-8000-000000000001',
        customerName: 'Alex Morgan',
        customerEmail: 'alex@example.com',
        isCapitecClient: true,
      });
    });
  });

  it('shows an empty-time message before a date is selected', async () => {
    render(<BookingPage />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Choose a branch/ })).toHaveValue('10000000-0000-4000-8000-000000000001'));
    expect(await screen.findByRole('grid')).toBeInTheDocument();
    expect(screen.queryByText('Select a date to see available times.')).not.toBeInTheDocument();
  });

  it('disables dates without availability and marks dates with slots', async () => {
    render(<BookingPage />);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const availableDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    expect(await screen.findByRole('button', { name: `Available ${availableDate}` })).toBeEnabled();
    const unavailableDay = tomorrow.getDate() === 1 ? 2 : 1;
    expect(screen.getByRole('button', { name: `Unavailable ${availableDate.slice(0, 8)}${String(unavailableDay).padStart(2, '0')}` })).toBeDisabled();
  });

  it('lets the user browse forward when there are no available dates', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/departments')) return jsonResponse([{ id: '20000000-0000-4000-8000-000000000001', name: 'Everyday Banking' }]);
      if (url.endsWith('/health')) return jsonResponse({ status: 'ok' });
      if (url.includes('/api/branches')) return jsonResponse([{ id: '10000000-0000-4000-8000-000000000001', name: 'Cape Town CBD', address: '12 Adderley Street' }]);
      if (url.includes('/api/slots/available-dates')) return jsonResponse([]);
      throw new Error(`Unexpected request: ${url}`);
    });
    render(<BookingPage />);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const expectedMonth = nextMonth.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    fireEvent.click(await screen.findByRole('button', { name: 'Next month' }));
    expect(await screen.findByText(expectedMonth)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeEnabled();
  });
});


