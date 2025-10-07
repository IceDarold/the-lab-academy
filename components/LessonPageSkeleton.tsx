import React from 'react';

const LessonPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Left Column: TOC Skeleton */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </aside>

        {/* Right Column: Main Content Skeleton */}
        <main className="lg:col-span-9">
          {/* Breadcrumbs & Title */}
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          
          {/* Article Content Skeleton */}
          <article className="mt-8 space-y-10">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
            </div>
             <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
};

export default LessonPageSkeleton;
