import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';
import FullScreenLoader from '../components/FullScreenLoader';
import { login as loginService, register as registerService, logout as logoutService, getMe } from '../services/auth.service';
import api from '../lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const currentUser = await getMe();
          setUser(currentUser);
        } catch (error) {
          console.error("Session check failed, token might be invalid:", error);
          // If the token is invalid, clear it from storage and headers
          localStorage.removeItem('authToken');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
        const { user: loggedInUser, token } = await loginService(email, password);
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(loggedInUser);
        window.location.hash = '#/dashboard';
    } catch (error) {
        console.error("AuthContext login error:", error);
        // Re-throw the error so the UI component can handle it
        throw error;
    }
  };

  const logout = async () => {
    await logoutService();
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.hash = '#/';
  };

  const register = async (fullName: string, email: string, password: string) => {
     try {
        const { user: newUser, token } = await registerService(fullName, email, password);
        localStorage.setItem('authToken', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(newUser);
        window.location.hash = '#/dashboard';
    } catch (error) {
        console.error("AuthContext register error:", error);
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
