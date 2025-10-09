import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, className = '', ...props }, ref) => {
    const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';
    const defaultClasses =
      'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500';

    return (
      <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="mt-1">
          <input
            id={id}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 ${
              error ? errorClasses : defaultClasses
            }`}
            {...props}
          />
        </div>
        {error !== undefined && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;