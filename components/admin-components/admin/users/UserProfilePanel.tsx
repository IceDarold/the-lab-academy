import * as React from 'react';
import { Suspense } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetOverlay,
} from '../../ui/sheet';
import { User } from './columns';
import Button from '../../ui/button';
import Badge from '../../ui/badge';
import Progress from '../../ui/progress';
import Skeleton from '../../ui/skeleton';
import { Ban, CheckCircle, PlayCircle, UserCheck, UserCog } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '../../ui/card';
import DonutChart from '../../ui/donut-chart';
import ChartSkeleton from './ChartSkeleton';
import { mockComparisonData, ComparisonActivityData } from './mock-chart-data';
import { getUserActivityLog } from '../../../../src/services/analytics.service';

// Lazy load heavy chart component
const UserActivityChart = React.lazy(() => import('./UserActivityChart'));

interface UserProfilePanelProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
}

const availableMetrics = [
  { key: 'lessonCompletions', label: 'Уроки', color: '#3b82f6' }, // Blue
  { key: 'quizAttempts', label: 'Квизы', color: '#a855f7' }, // Purple
  { key: 'codeExecutions', label: 'Запуски кода', color: '#22c55e' }, // Green
  { key: 'logins', label: 'Входы на платформу', color: '#eab308' }, // Yellow
];


const mockCourseProgress = [
  { name: 'Introduction to Machine Learning', progress: 75, status: 'In Progress' },
  { name: 'Advanced Deep Learning', progress: 100, status: 'Completed' },
  { name: 'Python for Data Science', progress: 20, status: 'In Progress' },
];

const mockRecentActivity = [
  { icon: CheckCircle, text: 'Completed lesson "Decision Trees"', time: '2 hours ago' },
  { icon: PlayCircle, text: 'Started course "Neural Networks"', time: 'Yesterday' },
  { icon: UserCheck, text: 'Registered on the platform', time: 'October 25, 2023' },
];

const mockPerformance = {
  quizAccuracy: { percentage: 87, correct: 123, total: 141 },
  difficultTopics: [
    { name: 'Урок "Градиентный Бустинг"', accuracy: 45 },
    { name: 'Урок "Регуляризация L1/L2"', accuracy: 52 },
  ],
  avgLessonTime: { user: 23, platform: 18 },
};

const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <div className="text-gray-100 font-medium">{children}</div>
  </div>
);

const CourseProgressItem: React.FC<{ name: string; progress: number }> = ({ name, progress }) => (
    <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-200">{name}</p>
            <p className="text-sm text-gray-400">{progress}%</p>
        </div>
        <Progress value={progress} />
    </div>
);

const ActivityItem: React.FC<{ icon: React.ElementType; text: string; time: string }> = ({ icon: Icon, text, time }) => (
    <div className="flex items-start gap-3">
        <div className="bg-gray-700 rounded-full p-2 mt-1">
            <Icon className="h-4 w-4 text-gray-300" />
        </div>
        <div>
            <p className="text-sm text-gray-200">{text}</p>
            <p className="text-xs text-gray-500">{time}</p>
        </div>
    </div>
);

const UserProfilePanelSkeleton: React.FC = () => (
    <div className="p-6 space-y-8">
        <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
            <div className="space-y-3 w-full">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-32" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-5 w-20" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-5 w-24" /></div>
        </div>
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
             <Skeleton className="h-9 w-36" />
             <Skeleton className="h-9 w-32" />
        </div>
        
        {/* Chart Skeleton */}
        <ChartSkeleton />

        {/* Performance Analytics Skeleton */}
        <div>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4"><Skeleton className="h-24 w-24 rounded-full" /><div className="w-full space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>
                <div className="space-y-4 p-4"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            </div>
        </div>

        <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-6">
                <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-2 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-2 w-full" /></div>
            </div>
        </div>
        
        {/* Admin Notes Skeleton */}
        <div>
            <Skeleton className="h-6 w-44 mb-4" />
            <Skeleton className="h-24 w-full" />
        </div>
    </div>
);


const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ user, onOpenChange }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [adminNote, setAdminNote] = React.useState('');
  const [activityData, setActivityData] = React.useState<ComparisonActivityData[]>([]);
  const [isChartLoading, setIsChartLoading] = React.useState(false);
  const [chartError, setChartError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      console.log(`[UserProfilePanel] User selected (id: ${user.id}). Fetching data...`);
      setIsLoading(true);
      setIsChartLoading(true);
      setAdminNote(''); // Reset note on new user
      setChartError(null);

      const fetchUserDetails = async () => {
        try {
          // Simulate user details fetch (could be extended to real API)
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log(`[UserProfilePanel] User details fetched for user ${user.id}.`);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          setIsLoading(false);
        }
      };

      const fetchActivityData = async () => {
        try {
          const data = await getUserActivityLog(user.id);
          setActivityData(data);
          setIsChartLoading(false);
        } catch (error) {
          console.error('Failed to fetch activity data:', error);
          setChartError('Failed to load activity data');
          setActivityData(mockComparisonData); // Fallback to mock data
          setIsChartLoading(false);
        }
      };

      fetchUserDetails();
      fetchActivityData();
    }
  }, [user]);

  const isOpen = !!user;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetOverlay />
      <SheetContent className="flex flex-col w-full max-w-4xl">
        <SheetHeader>
          <SheetTitle>Профиль пользователя</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
            {isLoading || !user ? (
                <UserProfilePanelSkeleton />
            ) : (
                <div className="p-6 space-y-8">
                    {/* User Info */}
                    <div className="flex items-center gap-6">
                        <div className="relative h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-blue-300 shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                         <InfoField label="Дата регистрации">
                           {format(new Date(user.registrationDate), 'LLL dd, yyyy')}
                         </InfoField>
                         <InfoField label="Роль">
                            <Badge variant={user.role === 'Admin' ? 'primary' : 'secondary'}>{user.role}</Badge>
                         </InfoField>
                         <InfoField label="Статус">
                            <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge>
                         </InfoField>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                        {user.role === 'Admin' ? (
                            <Button variant="destructive" size="sm"><UserCog className="h-4 w-4 mr-2"/>Лишить прав</Button>
                        ) : (
                            <Button variant="secondary" size="sm"><UserCog className="h-4 w-4 mr-2"/>Сделать админом</Button>
                        )}
                        {user.status === 'Active' ? (
                            <Button variant="destructive" size="sm"><Ban className="h-4 w-4 mr-2"/>Заблокировать</Button>
                        ) : (
                            <Button variant="secondary" size="sm"><CheckCircle className="h-4 w-4 mr-2"/>Разблокировать</Button>
                        )}
                    </div>

                     {/* User Activity Chart */}
                    <div>

                        {isChartLoading ? (
                            <ChartSkeleton />
                        ) : chartError ? (
                            <div className="text-center py-10 bg-gray-800 rounded-lg border border-red-700">
                                <p className="text-red-400">{chartError}</p>
                                <p className="text-gray-400 text-sm mt-2">Showing mock data as fallback</p>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <UserActivityChart data={activityData} availableMetrics={availableMetrics} />
                                </Suspense>
                            </div>
                        ) : activityData.length > 0 ? (
                            <Suspense fallback={<ChartSkeleton />}>
                                <UserActivityChart data={activityData} availableMetrics={availableMetrics} />
                            </Suspense>
                        ) : (
                           <div className="text-center py-10 bg-gray-800 rounded-lg border border-gray-700"><p className="text-gray-400">Нет данных об активности для построения графика.</p></div>
                        )}
                    </div>

                    {/* Performance Analytics */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Аналитика Успеваемости</h3>
                        <Card>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="flex flex-col items-center justify-center p-4 md:border-r md:border-gray-700">
                                    <DonutChart percentage={mockPerformance.quizAccuracy.percentage} />
                                    <p className="mt-2 font-semibold text-white">Точность на квизах</p>
                                    <p className="text-sm text-gray-400">{mockPerformance.quizAccuracy.correct}/{mockPerformance.quizAccuracy.total} правильных</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-200">Самые сложные темы</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-400 mt-1 space-y-1">
                                            {mockPerformance.difficultTopics.map(topic => (
                                                <li key={topic.name}><span>{topic.name}</span> <span className="text-red-400">({topic.accuracy}%)</span></li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-2">
                                        <h4 className="font-semibold text-gray-200">Среднее время на урок</h4>
                                        <p className="text-sm text-gray-400">{mockPerformance.avgLessonTime.user} минут (в среднем {mockPerformance.avgLessonTime.platform} мин)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Progress */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Прогресс по курсам</h3>
                        <div className="space-y-6">
                            {mockCourseProgress.map(course => (
                                <CourseProgressItem key={course.name} {...course} />
                            ))}
                        </div>
                    </div>
                    
                    {/* Admin Notes */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Административные заметки</h3>
                        <div className="space-y-2">
                            <textarea
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows={4}
                                placeholder="Добавьте приватную заметку об этом студенте..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={() => console.log('Saving note:', adminNote)}>Сохранить заметку</Button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Последняя активность</h3>
                        <div className="space-y-4">
                             {mockRecentActivity.map(activity => (
                                <ActivityItem key={activity.text} {...activity} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserProfilePanel;