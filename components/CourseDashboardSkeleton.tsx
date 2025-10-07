import React from 'react';
import Card from './Card';

const CourseDashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="space-y-12">
        {/* Header Skeleton */}
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-2xl"></div>
        </div>

        {/* Overall Progress Skeleton */}
        <Card>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 pt-2"></div>
          </div>
        </Card>

        {/* Syllabus Skeleton */}
        <section>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <Card className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-4 py-6">
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default CourseDashboardSkeleton;
