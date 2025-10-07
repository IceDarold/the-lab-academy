export interface StoredTokens {
  accessToken: string;
  refreshToken?: string | null;
  /** Epoch timestamp in milliseconds */
  expiresAt?: number | null;
}

const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'authRefreshToken';
const ACCESS_TOKEN_EXPIRY_KEY = 'authTokenExpiry';

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeGet = (key: string): string | null => {
  if (!isBrowser()) {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string | null) => {
  if (!isBrowser()) {
    return;
  }
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Swallow storage write errors (e.g. Safari private mode quotas)
  }
};

export const getStoredTokens = (): StoredTokens | null => {
  const accessToken = safeGet(ACCESS_TOKEN_KEY);
  if (!accessToken) {
    return null;
  }

  const refreshToken = safeGet(REFRESH_TOKEN_KEY);
  const expiresAtRaw = safeGet(ACCESS_TOKEN_EXPIRY_KEY);
  const parsedExpiresAt = expiresAtRaw ? Number(expiresAtRaw) : undefined;
  const expiresAt =
    typeof parsedExpiresAt === 'number' && Number.isFinite(parsedExpiresAt) ? parsedExpiresAt : undefined;

  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    expiresAt,
  };
};

export const storeTokens = (tokens: StoredTokens) => {
  safeSet(ACCESS_TOKEN_KEY, tokens.accessToken);
  safeSet(REFRESH_TOKEN_KEY, tokens.refreshToken ?? null);

  if (tokens.expiresAt && Number.isFinite(tokens.expiresAt)) {
    safeSet(ACCESS_TOKEN_EXPIRY_KEY, String(tokens.expiresAt));
  } else {
    safeSet(ACCESS_TOKEN_EXPIRY_KEY, null);
  }
};

export const clearStoredTokens = () => {
  safeSet(ACCESS_TOKEN_KEY, null);
  safeSet(REFRESH_TOKEN_KEY, null);
  safeSet(ACCESS_TOKEN_EXPIRY_KEY, null);
};
