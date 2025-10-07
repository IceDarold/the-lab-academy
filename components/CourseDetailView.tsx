import React from 'react';
import Card from './Card';
import Button from './Button';
import Accordion from './Accordion';

// Heroicons
const CheckIcon = () => (
    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const SignalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 3.375 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const AcademicCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v5.5a2.5 2.5 0 005 0V14" />
    </svg>
);

const CourseDetailView = () => {
    const syllabus = [
        {
            part: "Part 1: Introduction to Machine Learning",
            lessons: ["Welcome to the Course", "What is Machine Learning?", "Setting Up Your Environment", "Core Concepts and Terminology"]
        },
        {
            part: "Part 2: Supervised Learning - Regression",
            lessons: ["Linear Regression Theory", "Hands-On: Predicting Housing Prices", "Polynomial Regression", "Evaluating Regression Models"]
        },
        {
            part: "Part 3: Supervised Learning - Classification",
            lessons: ["Logistic Regression", "K-Nearest Neighbors (KNN)", "Support Vector Machines (SVM)", "Decision Trees and Random Forests"]
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Classical Machine Learning: From Data to Decision
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                            For Beginners
                        </span>
                        <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
                            Python
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div className="text-lg text-gray-600 dark:text-gray-400 space-y-4">
                    <p>This course provides a comprehensive introduction to the fundamental concepts and algorithms of classical machine learning. You will move from theoretical foundations to practical implementation, learning how to build predictive models that solve real-world problems.</p>
                    <p>No prior machine learning experience is required. We start with the basics and progressively build up your skills, using Python and its popular libraries like Scikit-learn and Pandas. By the end, you will be able to preprocess data, train various models, and evaluate their performance effectively.</p>
                </div>
                
                {/* What You'll Learn */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What You'll Learn</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <CheckIcon />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">Understand the core principles of supervised and unsupervised learning.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckIcon />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">Implement models like Linear Regression, Logistic Regression, and Decision Trees.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckIcon />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">Perform data preprocessing and feature engineering with Pandas.</span>
                        </li>
                        <li className="flex items-start">
                            <CheckIcon />
                            <span className="ml-3 text-gray-700 dark:text-gray-300">Evaluate and tune your models for optimal performance.</span>
                        </li>
                    </ul>
                </div>

                {/* Course Syllabus */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Course Syllabus</h2>
                    <div className="space-y-2">
                        {syllabus.map((item, index) => (
                            <Accordion key={item.part} title={item.part} defaultOpen={index === 0}>
                                <ul className="space-y-3 pl-4 list-disc list-inside">
                                    {item.lessons.map(lesson => (
                                        <li key={lesson}>{lesson}</li>
                                    ))}
                                </ul>
                            </Accordion>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (Sticky Sidebar) */}
            <div className="mt-8 lg:mt-0">
                <div className="lg:sticky lg:top-8">
                    <Card className="p-0 overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=870&auto.format&fit=crop" 
                            alt="Course preview"
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                            <Button variant="primary" className="w-full text-lg py-3" onClick={() => window.location.hash = '#/dashboard/course'}>
                                Enroll in the course
                            </Button>
                            <ul className="mt-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-center space-x-3">
                                    <SignalIcon />
                                    <span><strong>Level:</strong> Beginner</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <ClockIcon />
                                    <span><strong>Duration:</strong> ~20 hours</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <SparklesIcon />
                                    <span><strong>Format:</strong> Interactive lessons</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <AcademicCapIcon />
                                    <span><strong>Certificate:</strong> Upon completion</span>
                                </li>
                            </ul>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailView;