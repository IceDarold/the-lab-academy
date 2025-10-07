import React from 'react';
import Card from './Card';

const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <Card className="p-0 overflow-hidden flex flex-col h-full">
        {/* Image Placeholder */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700"></div>
        
        <div className="p-6 flex-grow flex flex-col">
          {/* Tags Placeholder */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>

          {/* Title Placeholder */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

          <div className="flex-grow mt-4 space-y-4">
             {/* Progress Bar Placeholder */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
             </div>
          </div>
          
          {/* Button Placeholder */}
          <div className="mt-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CourseCardSkeleton;
