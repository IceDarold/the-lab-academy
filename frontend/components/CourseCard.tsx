import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { CourseProgressStatus } from '../types/courses';

interface CourseCardProps {
  imageUrl: string;
  courseName: string;
  status: 'public' | CourseProgressStatus;
  tags?: string[];
  description?: string;
  progress?: number;
  onCourseClick?: () => void;
  completed?: boolean;
}

const CheckIcon = () => (
    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);


const CourseCard: React.FC<CourseCardProps> = ({
  imageUrl,
  courseName,
  status,
  tags,
  description,
  progress,
  onCourseClick,
  completed,
}) => {
  const isCompleted = completed ?? (status === 'completed');

  const getButtonText = () => {
    switch (status) {
      case 'public':
        return 'Learn More';
      case 'not_started':
        return 'Start Course';
      case 'in-progress':
        return 'Continue Course';
      case 'completed':
        return 'Repeat / View Materials';
      default:
        return '';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'relative inline-flex items-center justify-center px-4 py-2 border text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200';
    const variantClasses = isCompleted
      ? 'border-gray-300 text-gray-900 bg-white hover:bg-gray-50 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'
      : 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    return `${baseClasses} ${variantClasses} w-full`;
  };

  const completedBorderStyle = isCompleted ? 'border-green-500' : 'dark:border-gray-700';

  return (
    <motion.div
      className="cursor-pointer rounded-lg h-full shadow-lg"
      onClick={onCourseClick}
      whileHover={{ scale: 1.03, rotate: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className={`p-0 overflow-hidden flex flex-col h-full ${completedBorderStyle}`}>
        <div className="relative">
            <div className="aspect-w-16 aspect-h-9">
                <img className="object-cover w-full h-full brightness-90" src={imageUrl} alt={`Image for ${courseName}`} />
            </div>
            {isCompleted && (
                <div className="absolute inset-0 bg-green-600 bg-opacity-40 flex items-center justify-center">
                    <CheckIcon />
                </div>
            )}
        </div>
        
        <div className="p-6 flex-grow flex flex-col">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{courseName}</h3>

          <div className="flex-grow mt-4 space-y-4">
            {status === 'public' && (
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {description}
              </p>
            )}
            {(status === 'in-progress' || status === 'not_started') && typeof progress === 'number' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
                <ProgressBar progress={progress} />
              </div>
            )}
            {isCompleted && (
               <div className="flex items-center space-x-2">
                 <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                 </svg>
                 <span className="text-green-600 dark:text-green-400 font-semibold">Course Complete</span>
               </div>
             )}
          </div>
          
          <div className="mt-6">
            <button
              className={getButtonClasses()}
              type="button"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
