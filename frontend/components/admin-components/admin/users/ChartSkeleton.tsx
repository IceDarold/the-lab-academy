import * as React from 'react';

const ChartSkeleton: React.FC = () => (
  <div className="w-full animate-pulse bg-gray-800 p-6 rounded-lg border border-gray-700">
    {/* Header */}
    <div className="mb-4">
        <div className="h-4 w-48 bg-gray-700 rounded"/>
        <div className="h-6 w-64 bg-gray-700 rounded mt-2"/>
    </div>
    {/* Chart Area */}
    <div className="h-[300px] w-full bg-gray-700 rounded-md" />

    {/* Brush Area */}
    <div className="h-10 mt-4 w-full bg-gray-700 rounded-md" />

    {/* Legend Area */}
    <div className="flex flex-wrap gap-3 mt-6 justify-center">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-9 w-28 bg-gray-700 rounded-lg" />
      ))}
    </div>
  </div>
);

export default ChartSkeleton;
