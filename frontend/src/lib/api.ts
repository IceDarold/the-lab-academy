import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import { apiConfig } from './config';
import { AUTH_EVENTS, dispatchAuthEvent } from './authEvents';
import { clearStoredTokens, getStoredTokens, storeTokens } from './tokenStorage';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
  _is401Retry?: boolean;
};

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: number;
  tokenType?: string;
}

const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeoutMs,
});

// Separately configured client to avoid interceptor recursion during refresh
const refreshClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeoutMs,
});

let refreshPromise: Promise<string | null> | null = null;

const isBrowser = () => typeof window !== 'undefined';

const generateRequestId = (): string => {
  if (isBrowser()) {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch {
      // ignore and fall back below
    }
  }

  return `req_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateBackoffDelay = (attempt: number): number => {
  const { baseDelayMs, maxDelayMs } = apiConfig.retry;
  const delay = baseDelayMs * 2 ** (attempt - 1);
  return Math.min(delay, maxDelayMs);
};

const shouldRetryStatus = (status?: number): boolean => {
  if (!status) {
    return false;
  }

  if (status === 429) {
    return true;
  }

  return status >= 500 && status < 600;
};

const shouldSkip401Handling = (config?: RetriableRequestConfig): boolean => {
  if (!config?.url) {
    return false;
  }

  const normalizedUrl = config.url.replace(apiConfig.baseURL, '');
  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
  ].some((endpoint) =>
    normalizedUrl.includes(endpoint)
  );
};

const getExpiresAt = (data: RefreshResponse): number | undefined => {
  if (typeof data.expiresAt === 'number') {
    return data.expiresAt;
  }

  if (typeof data.expiresIn === 'number') {
    return Date.now() + data.expiresIn * 1000;
  }

  return undefined;
};

const resolveAuthorizationHeader = (token?: string | null, tokenType?: string | null) => {
  if (!token) {
    return undefined;
  }

  const scheme = tokenType ?? 'bearer';
  const normalizedScheme = `${scheme.charAt(0).toUpperCase()}${scheme.slice(1).toLowerCase()}`;
  return `${normalizedScheme} ${token}`;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        return null;
      }

      try {
        const response = await refreshClient.post<RefreshResponse>('/auth/refresh', {
          refreshToken: tokens.refreshToken,
        });

        const { accessToken, refreshToken, expiresIn, expiresAt, tokenType } = response.data;
        if (!accessToken) {
          throw new Error('Refresh payload missing accessToken');
        }

        const computedExpiresAt = getExpiresAt({ accessToken, refreshToken, expiresIn, expiresAt });

        storeTokens({
          accessToken,
          tokenType: tokenType ?? tokens.tokenType ?? 'bearer',
          refreshToken: refreshToken ?? tokens.refreshToken,
          expiresAt: computedExpiresAt,
        });

        dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
          accessToken,
          refreshToken: refreshToken ?? tokens.refreshToken ?? null,
          expiresAt: computedExpiresAt,
          tokenType: tokenType ?? tokens.tokenType ?? 'bearer',
        });

        return accessToken;
      } catch (error) {
        clearStoredTokens();
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

const forceLogout = (reason: 'unauthorized' | 'refresh-failed') => {
  clearStoredTokens();
  dispatchAuthEvent(AUTH_EVENTS.LOGOUT, { reason });
};

api.interceptors.request.use((config) => {
  const requestConfig = config as RetriableRequestConfig;

  requestConfig.baseURL ??= apiConfig.baseURL;
  requestConfig.timeout ??= apiConfig.timeoutMs;
  requestConfig.headers = requestConfig.headers ?? {};

  if (!requestConfig.headers['X-Request-ID']) {
    requestConfig.headers['X-Request-ID'] = generateRequestId();
  }

  const tokens = getStoredTokens();
  if (tokens?.accessToken && !requestConfig.headers.Authorization) {
    requestConfig.headers.Authorization = resolveAuthorizationHeader(
      tokens.accessToken,
      tokens.tokenType ?? undefined
    );
  }

  return requestConfig;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableRequestConfig;
    const status = error.response?.status;

    if (status === 401 && !shouldSkip401Handling(config)) {
      if (config._is401Retry) {
        forceLogout('refresh-failed');
        return Promise.reject(error);
      }

      config._is401Retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          forceLogout('unauthorized');
          return Promise.reject(error);
        }

        config.headers = config.headers ?? {};
        const tokens = getStoredTokens();
        config.headers.Authorization = resolveAuthorizationHeader(
          newAccessToken,
          tokens?.tokenType ?? undefined
        );

        return api(config);
      } catch (refreshError) {
        forceLogout('refresh-failed');
        return Promise.reject(refreshError);
      }
    }

    const isNetworkOrTimeoutError =
      error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');

    const maxAttempts = apiConfig.retry.maxAttempts;
    config._retryCount = config._retryCount ?? 0;

    if (isNetworkOrTimeoutError || shouldRetryStatus(status)) {
      if (config._retryCount < maxAttempts) {
        config._retryCount += 1;
        const delay = calculateBackoffDelay(config._retryCount);
        await sleep(delay);
        return api(config);
      }
    }

    if (status === 401 && shouldSkip401Handling(config)) {
      // For explicit auth failures we did not attempt to refresh – ensure tokens cleared
      clearStoredTokens();
    }

    return Promise.reject(
      isAxiosError(error)
        ? error
        : new AxiosError(error.message, error.code, config, error.request, error.response)
    );
  }
);

export default api;
