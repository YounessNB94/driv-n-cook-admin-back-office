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

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const { path, parseJson = true, headers, body, ...rest } = options;
  const url = buildApiUrl(path);
  const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
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
