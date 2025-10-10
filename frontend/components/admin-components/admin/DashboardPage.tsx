
import * as React from 'react';
import { Users, BookOpen, CheckCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

const StatCard: React.FC<{title: string, value: string, icon: React.ElementType}> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <Icon className="h-5 w-5 text-gray-500" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-50">{value}</div>
    </CardContent>
  </Card>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  console.log('[DashboardPage] Component rendered.');
  
  const handleNavigationClick = (path: string) => {
    console.log(`[DashboardPage] Quick action navigation to: ${path}`);
    onNavigate(path);
  };

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-400">Welcome back, Admin!</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="1,257" icon={Users} />
        <StatCard title="Active Courses" value="12" icon={BookOpen} />
        <StatCard title="Completed Lessons (Today)" value="150" icon={CheckCircle} />
        <StatCard title="New Signups (This Month)" value="78" icon={UserPlus} />
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-4">
            <Button
              variant="secondary"
              onClick={() => handleNavigationClick('/admin/content')}
            >
              Create New Course
            </Button>
             <Button
              variant="secondary"
              onClick={() => handleNavigationClick('/admin/users')}
            >
              Add New User
            </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
