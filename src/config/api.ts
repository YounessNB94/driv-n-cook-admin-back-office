const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080';

export const apiConfig = {
  baseUrl: DEFAULT_BASE_URL,
};

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiConfig.baseUrl}${normalizedPath}`;
};
