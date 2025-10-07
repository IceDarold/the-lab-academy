import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import CourseCard from '../components/CourseCard';
import Modal from '../components/Modal';
import CourseDetailView from '../components/CourseDetailView';

// Heroicon SVGs as components
const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const CodeBracketSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
    </svg>
);

const CheckBadgeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


const LandingPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="w-full">
                {/* Hero Section */}
                <section className="text-center py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        From Theory to Practice: Your Interactive Path to Machine Learning.
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                        Stop just reading. Start coding and solving real-world problems right in your browser from the first lesson.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="primary" className="px-8 py-3 text-base" onClick={() => window.location.hash = '#/register'}>
                            Start learning for free
                        </Button>
                        <Button variant="secondary" className="px-8 py-3 text-base" onClick={() => window.location.hash = '#/courses'}>
                            View all courses
                        </Button>
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section className="py-20 lg:py-24 bg-white dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                                Learn by Doing
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                An innovative approach to mastering complex topics.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            <Card className="text-center flex flex-col items-center">
                                <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                    <BookOpenIcon />
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Interactive Theory
                                </h3>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Engage with concepts through interactive examples and visualizations that bring theory to life.
                                </p>
                            </Card>
                            <Card className="text-center flex flex-col items-center">
                                <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                    <CodeBracketSquareIcon />
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Code in the Browser
                                </h3>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Execute Python, Pandas, and Scikit-learn code directly in your browser. No setup required.
                                </p>
                            </Card>
                            <Card className="text-center flex flex-col items-center">
                                <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                                    <CheckBadgeIcon />
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Instant Feedback
                                </h3>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Get immediate feedback on your code with integrated quizzes and practical assignments.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>
                
                {/* Popular Courses Section */}
                <section className="py-20 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                                Start Your Journey
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                Explore our most popular courses and find your path in Machine Learning.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="h-full">
                                <CourseCard
                                    status="public"
                                    courseName="Classic ML Algorithms"
                                    tags={['Beginner', 'Python']}
                                    description="Master the fundamentals of machine learning, from linear regression to support vector machines."
                                    imageUrl="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=870&auto=format&fit=crop"
                                    onCourseClick={() => setIsModalOpen(true)}
                                />
                            </div>
                            <div className="h-full">
                                <CourseCard
                                    status="public"
                                    courseName="Deep Dive into Neural Networks"
                                    tags={['Intermediate', 'PyTorch']}
                                    description="Build and train your first neural networks for image classification and natural language processing."
                                    imageUrl="https://images.unsplash.com/photo-1555431182-0c3e4383a1ec?q=80&w=870&auto=format&fit=crop"
                                    onCourseClick={() => setIsModalOpen(true)}
                                />
                            </div>
                            <div className="h-full">
                                <CourseCard
                                    status="public"
                                    courseName="Data Wrangling with Pandas"
                                    tags={['Beginner', 'Data Science']}
                                    description="Learn the art of cleaning, transforming, and analyzing data with the powerful Pandas library."
                                    imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=870&auto=format&fit=crop"
                                    onCourseClick={() => setIsModalOpen(true)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <CourseDetailView />
            </Modal>
        </>
    );
};

export default LandingPage;