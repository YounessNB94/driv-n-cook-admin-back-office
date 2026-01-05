import { buildApiUrl } from '../config/api';

export interface ApiRequestOptions extends RequestInit {
  path: string;
  parseJson?: boolean;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

const AUTH_TOKEN_KEY = 'drivncook:accessToken';
export const AUTH_TOKEN_EVENT = 'drivncook:auth-token-changed';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  window.dispatchEvent(
    new CustomEvent<{ authenticated: boolean }>(AUTH_TOKEN_EVENT, {
      detail: { authenticated: Boolean(token) },
    }),
  );
};

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const { path, parseJson = true, headers, body, ...rest } = options;
  const url = buildApiUrl(path);
  const authToken = getStoredToken();
  const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body,
  });

  if (!response.ok) {
    let errorDetails: unknown;
    try {
      errorDetails = await response.json();
    } catch (error) {
      errorDetails = undefined;
    }
    throw new ApiError(`Request to ${path} failed`, response.status, errorDetails);
  }

  if (!parseJson) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function buildJsonBody(payload: unknown): string {
  return JSON.stringify(payload ?? {});
}
