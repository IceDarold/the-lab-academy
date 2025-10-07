import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';
import FullScreenLoader from '../components/FullScreenLoader';
import { login as loginService, register as registerService, logout as logoutService } from '../services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // This effect runs once on app load to check for an existing session.
    setIsLoading(true);
    const timer = setTimeout(() => {
      // In a real app, you'd verify a token from localStorage here.
      // For now, we simulate that no user is logged in on initial load.
      setUser(null);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    try {
        const loggedInUser = await loginService(email, password);
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
    setUser(null);
    window.location.hash = '#/';
  };

  const register = async (fullName: string, email: string, password: string) => {
     try {
        const newUser = await registerService(fullName, email, password);
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