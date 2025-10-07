interface RetryConfig {
  /** Maximum number of retries for eligible requests */
  readonly maxAttempts: number;
  /** Base delay in milliseconds used to calculate exponential backoff */
  readonly baseDelayMs: number;
  /** Maximum delay in milliseconds between retries */
  readonly maxDelayMs: number;
}

interface ApiConfig {
  readonly baseURL: string;
  readonly timeoutMs: number;
  readonly retry: RetryConfig;
}

const DEFAULT_DEV_API_URL = 'http://localhost:8000/api';
const DEFAULT_PROD_API_URL = 'https://api.the-lab-academy.com/api';

const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined') {
      const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
      const value = meta.env?.[key];
      if (typeof value === 'string') {
        return value;
      }
    }
  } catch {
    // ignore and fall back to process.env
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  return undefined;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const resolveApiUrl = (): string => {
  const envUrl = getEnv('VITE_API_URL');
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  const mode = getEnv('MODE') ?? getEnv('NODE_ENV') ?? 'development';
  return mode === 'production' ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL;
};

export const apiConfig: ApiConfig = {
  baseURL: resolveApiUrl(),
  timeoutMs: parseNumber(getEnv('VITE_API_TIMEOUT'), 15000),
  retry: {
    maxAttempts: parseNumber(getEnv('VITE_API_MAX_RETRIES'), 3),
    baseDelayMs: parseNumber(getEnv('VITE_API_RETRY_BASE_DELAY'), 300),
    maxDelayMs: parseNumber(getEnv('VITE_API_RETRY_MAX_DELAY'), 5000),
  },
};

export type { ApiConfig, RetryConfig };
