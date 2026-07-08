/**
 * HTTP client for the FriesianAI API server (apps/server).
 *
 * The frontend MVP runs fully client-side against local repositories, but
 * every repository has the same shape as its server counterpart — switching
 * to the API means swapping the repository implementation to one built on
 * this client (see services/repositories/README note in ARCHITECTURE.md).
 */

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new ApiError(response.status, text || response.statusText);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
