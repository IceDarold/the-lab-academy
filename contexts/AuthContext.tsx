import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, AuthResponse } from '../types/auth';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applyTokensToStorage = useCallback((tokens: StoredTokens) => {
    storeTokens(tokens);

    if (api.defaults.headers?.common) {
      if (tokens.accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
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
        refreshToken: detail.refreshToken ?? undefined,
        expiresAt: detail.expiresAt,
      });
    };

    window.addEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    return () => {
      window.removeEventListener(AUTH_EVENTS.TOKEN_REFRESHED, handleTokenRefreshed);
    };
  }, [applyTokensToStorage]);

  const persistAuthTokens = (auth: AuthResponse) => {
    const expiresAt =
      auth.expiresAt ?? (auth.expiresIn ? Date.now() + auth.expiresIn * 1000 : undefined);

    applyTokensToStorage({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      expiresAt,
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const auth = await loginService(email, password);
      persistAuthTokens(auth);
      setUser(auth.user);
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }

      dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken ?? null,
      });
    } catch (error) {
      console.error('AuthContext login error:', error);
      // Re-throw the error so the UI component can handle it
      throw error;
    }
  };

  const logout = async () => {
    const tokens = getStoredTokens();

    await logoutService(tokens?.refreshToken);
    clearSession('#/');
    dispatchAuthEvent(AUTH_EVENTS.LOGOUT, { reason: 'manual' });
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const auth = await registerService(fullName, email, password);
      persistAuthTokens(auth);
      setUser(auth.user);
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }

      dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken ?? null,
      });
    } catch (error) {
      console.error('AuthContext register error:', error);
      // Re-throw the error so the UI component can handle it
      throw error;
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
