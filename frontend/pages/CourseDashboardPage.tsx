import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Accordion from '../components/Accordion';
import Button from '../components/Button';
import { CourseDetails, CourseModuleSummary, CourseLessonSummary, CourseProgressStatus } from '../types/courses';
import { getCourseDetails } from '../services/courses.service';
import CourseDashboardSkeleton from '../components/CourseDashboardSkeleton';

// --- Icons for Lesson Status ---

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-500">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const InProgressIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-indigo-500">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
    </svg>
);

const NotStartedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 dark:text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const getStatusIcon = (status: CourseProgressStatus) => {
    switch (status) {
        case 'completed':
            return <CheckCircleIcon />;
        case 'in-progress':
            return <InProgressIcon />;
        case 'not_started':
        default:
            return <NotStartedIcon />;
    }
};

const getStatusBadgeClasses = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'In Progress': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

type ModuleWithProgress = CourseModuleSummary & {
    lessons: CourseLessonSummary[];
    completedLessons: number;
    totalLessons: number;
    progress: number;
    statusLabel: 'Not Started' | 'In Progress' | 'Completed';
};

const CourseDashboardPage = () => {
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCompletionBanner, setShowCompletionBanner] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const hash = window.location.hash;
                const slug = new URLSearchParams(hash.substring(hash.indexOf('?'))).get('slug');

                if (!slug) {
                throw new Error("Course slug not found in URL.");
                }

                setIsLoading(true);
                setError(null);
                
                const courseDetails = await getCourseDetails(slug);
                
                if (!courseDetails) {
                throw new Error("Course not found.");
                }
                
                setCourse(courseDetails);
            } catch (err) {
                setError((err as Error).message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        const handleHashChange = () => {
            const hash = window.location.hash;
            const completed = new URLSearchParams(hash.substring(hash.indexOf('?'))).get('completed');
            setShowCompletionBanner(completed === 'true');
            fetchCourse();
        };

        handleHashChange(); // Initial check
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    if (isLoading) {
        return <CourseDashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <Card>
                    <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">An Error Occurred</h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{error}</p>
                    <Button variant="primary" className="mt-6" onClick={() => window.location.hash = '#/dashboard'}>
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    if (!course) {
        return null;
    }

    const sortedModules: CourseModuleSummary[] = [...course.modules].sort((a, b) => a.order - b.order);
    const moduleSummaries: ModuleWithProgress[] = sortedModules.map((module) => {
        const lessons = [...module.lessons].sort((a, b) => {
            const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            const titleA = a.title ?? '';
            const titleB = b.title ?? '';
            return titleA.localeCompare(titleB);
        });

        const completedLessons = lessons.filter((lesson) => lesson.status === 'completed').length;
        const totalLessons = lessons.length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const statusLabel =
            totalLessons === 0
                ? 'Not Started'
                : completedLessons === totalLessons
                ? 'Completed'
                : completedLessons > 0
                ? 'In Progress'
                : 'Not Started';

        return {
            ...module,
            lessons,
            completedLessons,
            totalLessons,
            progress,
            statusLabel,
        };
    });

    const aggregatedStats = moduleSummaries.reduce(
        (acc, module) => {
            acc.partsTotal += 1;
            if (module.statusLabel === 'Completed') {
                acc.partsCompleted += 1;
            }
            acc.lessonsTotal += module.totalLessons;
            acc.lessonsCompleted += module.completedLessons;
            return acc;
        },
        { partsCompleted: 0, partsTotal: 0, lessonsCompleted: 0, lessonsTotal: 0 }
    );

    const overallProgress = course.overallProgressPercent;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-12">
                {/* Completion Banner */}
                {showCompletionBanner && (
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg relative shadow-md" role="alert">
                        <div className="flex items-center">
                            <strong className="font-bold text-lg">Congratulations!</strong>
                            <span className="block sm:inline ml-2">You've successfully completed the course.</span>
                        </div>
                        <button onClick={() => setShowCompletionBanner(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
                           <svg className="fill-current h-6 w-6 text-green-500 hover:text-green-700" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.652 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.697 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </button>
                    </div>
                )}

                {/* Header */}
                <div>
                    <nav className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <a href="#/dashboard" onClick={(e) => { e.preventDefault(); window.location.hash = '#/dashboard'; }} className="hover:text-gray-700 dark:hover:text-gray-200">My Courses</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-700 dark:text-gray-200">{course.title}</span>
                    </nav>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {course.title}
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                        {course.description}
                    </p>
                </div>

                {/* Overall Progress */}
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Course Progress</h2>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Progress</span>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
                        </div>
                        <ProgressBar progress={overallProgress} />
                        <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                            Completed {aggregatedStats.partsCompleted} of {aggregatedStats.partsTotal} modules
                            <span className="mx-2">|</span>
                            {aggregatedStats.lessonsCompleted} of {aggregatedStats.lessonsTotal} lessons
                        </p>
                    </div>
                </Card>

                {/* Syllabus */}
                {moduleSummaries.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Course Syllabus
                        </h2>
                        <Card className="p-0">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {moduleSummaries.map((section) => (
                                <Accordion 
                                    key={section.title} 
                                    defaultOpen={section.statusLabel === 'In Progress'}
                                    title={
                                        <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4">
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{section.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getStatusBadgeClasses(section.statusLabel)}`}>
                                                    {section.statusLabel}
                                                </span>
                                                <div className="w-full sm:w-32">
                                                    <ProgressBar progress={section.progress} />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <ul className="space-y-1 py-2">
                                        {section.lessons.map((lesson, index) => {
                                            const lessonNumber =
                                                typeof lesson.order === 'number'
                                                    ? lesson.order
                                                    : index + 1;
                                            return (
                                                <li key={lesson.slug || lesson.lessonId || `${section.title}-${index}`}>
                                                    <a href={`#/lesson?slug=${lesson.slug}`} onClick={(e) => { e.preventDefault(); window.location.hash = `#/lesson?slug=${lesson.slug}`; }} className="flex items-center p-3 -mx-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors duration-200 group">
                                                        <div className="flex-shrink-0">
                                                            {getStatusIcon(lesson.status)}
                                                        </div>
                                                        <div className="ml-4 flex-grow">
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                                Lesson {lessonNumber}: {lesson.title}
                                                            </p>
                                                        </div>
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Accordion>
                            ))}
                            </div>
                        </Card>
                    </section>
                )}

            </div>
        </div>
    );
};

export default CourseDashboardPage;
