import * as React from 'react';

interface TooltipContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const TooltipContext = React.createContext<TooltipContextProps | null>(null);

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen, triggerRef, contentRef }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error('TooltipTrigger must be used within a Tooltip');

  const { setIsOpen, triggerRef } = context;

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error('TooltipContent must be used within a Tooltip');

  const { isOpen, contentRef, triggerRef } = context;
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useLayoutEffect(() => {
    if (isOpen && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      const top = triggerRect.top - contentRect.height - 8 + window.scrollY;
      const left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2) + window.scrollX;
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef, contentRef]);

  if (!isOpen) return null;
  
  return (
      <div
        ref={contentRef}
        role="tooltip"
        style={{ top: `${position.top}px`, left: `${position.left}px`}}
        className={`absolute z-50 rounded-md bg-gray-900 border border-gray-600 px-3 py-1.5 text-sm text-gray-100 shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}
      >
        {children}
      </div>
  );
};
