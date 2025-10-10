
import * as React from 'react';
import { X } from 'lucide-react';

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export const Sheet: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onOpenChange]);

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
};

export const SheetOverlay: React.FC = () => {
  const { open, onOpenChange } = React.useContext(SheetContext);
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => onOpenChange(false)}
    />
  );
};

export const SheetContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { open } = React.useContext(SheetContext);
  return (
    <div
      className={`fixed z-50 h-full w-full max-w-2xl bg-gray-800 border-l border-gray-700 top-0 right-0 transition-transform transform ${
        open ? 'translate-x-0' : 'translate-x-full'
      } ease-in-out duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export const SheetHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={`flex flex-col space-y-2 text-center sm:text-left p-6 border-b border-gray-700 ${className}`}
  >
    {children}
  </div>
);

export const SheetTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <h2
    className={`text-lg font-semibold text-gray-100 ${className}`}
  >
    {children}
  </h2>
);

export const SheetClose: React.FC = () => {
  const { onOpenChange } = React.useContext(SheetContext);
  return (
    <button
      onClick={() => onOpenChange(false)}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
    >
      <X className="h-6 w-6 text-gray-400 hover:text-white" />
      <span className="sr-only">Close</span>
    </button>
  );
};
