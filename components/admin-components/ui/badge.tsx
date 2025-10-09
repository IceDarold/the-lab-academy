
import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'secondary', ...props }) => {
  const variantClasses = {
    primary: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    secondary: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export default Badge;