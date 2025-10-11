import React, { useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import FullScreenLoader from '../FullScreenLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // We only want to redirect if the loading is complete and the user is NOT authenticated.
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated. Redirecting to login.');
      window.location.hash = '#/login';
    }
  }, [isAuthenticated, isLoading]);

  // While the auth state is being determined, show a loader.
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // If authenticated, render the children components.
  // The useEffect will handle the redirect for unauthenticated users.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, we can show a loader while redirecting
  // to prevent a flash of an empty screen.
  return <FullScreenLoader />;
};

export default ProtectedRoute;
