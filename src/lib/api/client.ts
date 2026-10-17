const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type ApiFailureKind = 'offline' | 'server';

export class ApiRequestError extends Error {
  constructor(message: string, public readonly ticketId: string, public readonly kind: ApiFailureKind) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class ApiHttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiHttpError';
  }
}

function createTicketId(): string {
  const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  return `TKT-${uuid.toUpperCase()}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const generatedTicketId = createTicketId();
  const headers = new Headers(init?.headers);
  headers.set('X-Request-ID', generatedTicketId);
  try {
    const response = await fetch(`${API_URL}${path}`, { ...init, headers });
    let result: { error?: string; ticketId?: string };
    try {
      result = await response.json() as { error?: string; ticketId?: string };
    } catch {
      result = {};
    }
    if (!response.ok) {
      if (response.status >= 500) {
        throw new ApiRequestError(
          'Our service is temporarily unavailable. Please try again shortly.',
          result.ticketId || response.headers.get('X-Request-ID') || generatedTicketId,
          'server',
        );
      }
      throw new ApiHttpError(result.error || 'The request could not be completed.', response.status);
    }
    return result as T;
  } catch (cause) {
    if (cause instanceof ApiRequestError) throw cause;
    if (cause instanceof TypeError) {
      throw new ApiRequestError(
        'Our service is currently offline. Please try again shortly.',
        generatedTicketId,
        'offline',
      );
    }
    throw cause;
  }
}

export function apiGet<T>(path: string) { return request<T>(path); }
export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
