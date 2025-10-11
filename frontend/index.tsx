import './index.css';
import React, { useState, useEffect, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FullScreenLoader from './components/FullScreenLoader';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AnalyticsTracker from './components/AnalyticsTracker';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegistrationPage = React.lazy(() => import('./pages/RegistrationPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const CourseDashboardPage = React.lazy(() => import('./pages/CourseDashboardPage'));
const LessonPage = React.lazy(() => import('./pages/LessonPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));

const App = () => {
  const [route, setRoute] = useState(window.location.hash);
  const { isAuthenticated, isLoading } = useAuth();
  const isDebug = import.meta.env.VITE_MODE === 'DEBUG';

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
        const coursePage = <ErrorBoundary><CourseDashboardPage /></ErrorBoundary>;
        return isDebug ? coursePage : <ProtectedRoute>{coursePage}</ProtectedRoute>;
    }
    if (route.startsWith('#/lesson')) {
        const lessonPage = <ErrorBoundary><LessonPage /></ErrorBoundary>;
        return isDebug ? lessonPage : <ProtectedRoute>{lessonPage}</ProtectedRoute>;
    }
    if (route.startsWith('#/dashboard/profile')) {
        return <ProtectedRoute><ErrorBoundary><ProfilePage /></ErrorBoundary></ProtectedRoute>;
    }
    if (route.startsWith('#/admin')) {
        if (route === '#/admin') {
            window.location.hash = '#/admin/content';
            return null;
        }
        const adminPage = <ErrorBoundary><AdminPage activePath={route} onNavigate={(path) => window.location.hash = path} /></ErrorBoundary>;
        return isDebug ? adminPage : <ProtectedRoute>{adminPage}</ProtectedRoute>;
    }

    // Handle static routes
    switch (route) {
      case '#/login':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><ErrorBoundary><LoginPage /></ErrorBoundary></div>;
      case '#/register':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><ErrorBoundary><RegistrationPage /></ErrorBoundary></div>;
      case '#/forgot-password':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><ErrorBoundary><ForgotPasswordPage /></ErrorBoundary></div>;
      case '#/reset-password':
        return <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"><ErrorBoundary><ResetPasswordPage /></ErrorBoundary></div>;
      case '#/courses':
        return <ErrorBoundary><CoursesPage /></ErrorBoundary>;
      case '#/dashboard':
        const dashboardPage = <ErrorBoundary><DashboardPage /></ErrorBoundary>;
        return isDebug ? dashboardPage : <ProtectedRoute>{dashboardPage}</ProtectedRoute>;
      case '#/':
      case '':
      default:
        return <ErrorBoundary><LandingPage /></ErrorBoundary>;
    }
  };

  const isAuthPage = route === '#/login' || route === '#/register';
  const isAdminRoute = route.startsWith('#/admin');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
      <Toaster position="top-right" />
      <Analytics />
      {!isAuthPage && !isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence>
          <motion.div
            key={route}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<FullScreenLoader />}>
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && !isAdminRoute && <Footer />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  );
}
