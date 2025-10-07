import './index.css';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CoursesPage from './pages/CoursesPage';
import DashboardPage from './pages/DashboardPage';
import CourseDashboardPage from './pages/CourseDashboardPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageTransitionWrapper from './components/PageTransitionWrapper';

const App = () => {
  const [route, setRoute] = useState(window.location.hash);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0); // Scroll to top on page change
    };

    window.addEventListener('hashchange', handleHashChange);

    // Set initial route if none exists
    if (window.location.hash === '') {
        window.location.hash = '#/';
    }
    handleHashChange();


    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  useEffect(() => {
    if (isLoading) {
      return; // Don't perform redirects until auth state is known
    }
    
    // This logic handles redirecting authenticated users away from login/register
    const authRoutes = ['#/login', '#/register'];
    const isAuthRoute = authRoutes.includes(route);

    if (isAuthenticated && isAuthRoute) {
        window.location.hash = '#/dashboard';
    }

    // The logic for protecting routes is now handled by the ProtectedRoute component.

  }, [route, isAuthenticated, isLoading]);

  const renderPage = () => {
    // Handle routes with potential parameters first
    if (route.startsWith('#/dashboard/course')) {
        return <ProtectedRoute><CourseDashboardPage /></ProtectedRoute>;
    }
    if (route.startsWith('#/lesson')) {
        return <ProtectedRoute><LessonPage /></ProtectedRoute>;
    }
    if (route.startsWith('#/dashboard/profile')) {
        return <ProtectedRoute><ProfilePage /></ProtectedRoute>;
    }

    // Handle static routes
    switch (route) {
      case '#/login':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><LoginPage /></div>;
      case '#/register':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><RegistrationPage /></div>;
      case '#/forgot-password':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><ForgotPasswordPage /></div>;
      case '#/reset-password':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><ResetPasswordPage /></div>;
      case '#/courses':
        return <CoursesPage />;
      case '#/dashboard':
        return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
      case '#/':
      case '':
      default:
        return <LandingPage />;
    }
  };

  const isAuthPage = route === '#/login' || route === '#/register';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
      <Toaster position="top-right" />
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <PageTransitionWrapper key={route}>
            {renderPage()}
          </PageTransitionWrapper>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
