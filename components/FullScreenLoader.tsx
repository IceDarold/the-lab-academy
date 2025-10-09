import React from 'react';

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" aria-label="Loading application">
      <svg
        className="animate-spin h-10 w-10 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <circle
          className="opacity-75"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        ></circle>
      </svg>
    </div>
  );
};

export default FullScreenLoader;
