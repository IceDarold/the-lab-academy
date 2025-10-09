
import * as React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative flex items-center justify-center w-4 h-4">
        <input
          type="checkbox"
          ref={ref}
          className="peer appearance-none h-4 w-4 shrink-0 rounded-sm border border-blue-400 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-blue-600 checked:border-blue-600"
          {...props}
        />
        <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
      </label>
    );
  }
);

export default Checkbox;