import * as React from 'react';
import { Suspense } from 'react';
import Sidebar from '../components/admin-components/Sidebar';
import Header from '../components/admin-components/Header';

// Lazy load admin page components
const DashboardPage = React.lazy(() => import('../components/admin-components/admin/DashboardPage'));
const UsersPage = React.lazy(() => import('../components/admin-components/admin/UsersPage'));
const ContentManagementPage = React.lazy(() => import('../components/admin-components/admin/ContentManagementPage'));
const SettingsPage = React.lazy(() => import('../components/admin-components/admin/SettingsPage'));

// Loading fallback for admin components
const AdminLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

interface AdminPageProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ activePath, onNavigate }) => {
  const internalPath = activePath.replace('#/admin', '') || '/admin';

  const setActivePath = (path: string) => {
    onNavigate('#/admin' + path);
  };

  const renderPage = () => {
    switch (internalPath) {
      case '/admin':
        return <DashboardPage onNavigate={setActivePath} />;
      case '/admin/content':
        return <ContentManagementPage />;
      case '/admin/users':
        return <UsersPage />;
      case '/admin/settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActivePath} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar activePath={internalPath} onNavigate={setActivePath} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activePath={internalPath} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<AdminLoader />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;