import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center px-4 py-2 border text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200';

  const variantClasses = {
    primary:
      'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary:
      'border-gray-300 text-gray-900 bg-white hover:bg-gray-50 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
  };

  const stateClasses =
    disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  const spinnerColorClass = variant === 'primary' ? 'text-white' : 'text-indigo-500';
    
  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={`animate-spin h-5 w-5 ${spinnerColorClass}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {loading ? (
        <span className="opacity-0">
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
