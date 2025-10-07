import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { User, AuthContextType, AuthTokens } from '../types/auth';
import FullScreenLoader from '../components/FullScreenLoader';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getMe,
} from '../services/auth.service';
import api from '../lib/api';
import { clearStoredTokens, getStoredTokens, storeTokens, StoredTokens } from '../lib/tokenStorage';
import {
  AUTH_EVENTS,
  dispatchAuthEvent,
  LogoutEventDetail,
  TokenRefreshedDetail,
} from '../lib/authEvents';

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    return error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applyTokensToStorage = useCallback((tokens: StoredTokens) => {
    storeTokens(tokens);

    if (api.defaults.headers?.common) {
      if (tokens.accessToken) {
        const scheme = tokens.tokenType ?? 'bearer';
        const normalizedScheme =
          typeof scheme === 'string' && scheme.trim().length > 0
            ? `${scheme[0].toUpperCase()}${scheme.slice(1).toLowerCase()}`
            : 'Bearer';
        api.defaults.headers.common['Authorization'] = `${normalizedScheme} ${tokens.accessToken}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    }
  }, []);

  const clearSession = useCallback(
    (redirectHash?: string) => {
      clearStoredTokens();

      if (api.defaults.headers?.common?.Authorization) {
        delete api.defaults.headers.common['Authorization'];
      }

      setUser(null);

      if (redirectHash && typeof window !== 'undefined') {
        window.location.hash = redirectHash;
      }
    },
    []
  );

  useEffect(() => {
    const checkSession = async () => {
      const tokens = getStoredTokens();

      if (!tokens?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        applyTokensToStorage({
          accessToken: tokens.accessToken,
          tokenType: tokens.tokenType ?? 'bearer',
          refreshToken: tokens.refreshToken ?? undefined,
          expiresAt: tokens.expiresAt ?? undefined,
        });
        const currentUser = await getMe();
        setUser(currentUser);
      } catch (error) {
        console.error('Session check failed, token might be invalid:', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [clearSession]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleForcedLogout = (event: Event) => {
      const detail = (event as CustomEvent<LogoutEventDetail>).detail;
      clearSession(detail?.reason === 'manual' ? undefined : '#/login');
      setIsLoading(false);
    };

    window.addEventListener(AUTH_EVENTS.LOGOUT, handleForcedLogout);
    return () => {
      window.removeEventListener(AUTH_EVENTS.LOGOUT, handleForcedLogout);
    };
  }, [clearSession]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleTokenRefreshed = (event: Event) => {
      const detail = (event as CustomEvent<TokenRefreshedDetail>).detail;
      if (!detail?.accessToken) {
        return;
      }

      applyTokensToStorage({
        accessToken: detail.accessToken,
        tokenType: detail.tokenType ?? 'bearer',
        refreshToken: detail.refreshToken ?? undefined,
        expiresAt: detail.expiresAt,
      });
    };

    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    return () => {
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    };
  }, [applyTokensToStorage]);

  const persistAuthTokens = (tokens: AuthTokens) => {
    const expiresAt =
      tokens.expiresAt ?? (tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined);

    applyTokensToStorage({
      accessToken: tokens.accessToken,
      tokenType: tokens.tokenType,
      refreshToken: tokens.refreshToken ?? undefined,
      expiresAt,
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const tokens = await loginService(email, password);
      persistAuthTokens(tokens);
      const currentUser = await getMe();
      setUser(currentUser);
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }

      dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? null,
        tokenType: tokens.tokenType ?? 'bearer',
      });
    } catch (error) {
      console.error('AuthContext login error:', error);
      // Re-throw the error so the UI component can handle it
      throw new Error(extractErrorMessage(error));
    }
  };

  const logout = async () => {
    await logoutService();
    clearSession('#/');
    dispatchAuthEvent(AUTH_EVENTS.LOGOUT, { reason: 'manual' });
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const result = await registerService(fullName, email, password);

      if (result.status === 'pending_confirmation') {
        return { status: 'pending_confirmation' as const };
      }

      persistAuthTokens(result.tokens);
      const currentUser = await getMe();
      setUser(currentUser);
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }

      dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken ?? null,
        tokenType: result.tokens.tokenType ?? 'bearer',
      });

      return { status: 'authenticated' as const, tokens: result.tokens };
    } catch (error) {
      console.error('AuthContext register error:', error);
      // Re-throw the error so the UI component can handle it
      throw new Error(extractErrorMessage(error));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };
  
  // Display a loader only during the initial session check
  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
