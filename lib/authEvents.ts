export const AUTH_EVENTS = {
  LOGOUT: 'auth:logout',
  TOKEN_REFRESHED: 'auth:token-refreshed',
} as const;

type AuthEventName = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];

export interface LogoutEventDetail {
  reason: 'unauthorized' | 'manual' | 'refresh-failed';
}

export interface TokenRefreshedDetail {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number;
  tokenType?: string | null;
}

const isBrowser = () => typeof window !== 'undefined' && typeof window.dispatchEvent === 'function';

export const dispatchAuthEvent = <T>(name: AuthEventName, detail?: T) => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(name, { detail }));
};
