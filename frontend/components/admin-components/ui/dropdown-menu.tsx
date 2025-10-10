
import * as React from 'react';

const DropdownMenuContext = React.createContext({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => {},
});

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setIsOpen } = React.useContext(DropdownMenuContext);
  return <div onClick={() => setIsOpen(true)}>{children}</div>;
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; align?: 'start' | 'end' }> = ({ children, align = 'end' }) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      ref={menuRef}
      className={`absolute ${alignmentClass} z-50 mt-2 w-56 origin-top-right rounded-md bg-gray-800 border border-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

export const DropdownMenuItem: React.FC<{ children: React.ReactNode; onClick?: () => void, className?: string, href?: string }> = ({ children, onClick, className, href = "#" }) => {
    const { setIsOpen } = React.useContext(DropdownMenuContext);
    const handleClick = () => {
        if (onClick) onClick();
        setIsOpen(false);
    };
    return (
        <a
            href={href}
            onClick={(e) => { e.preventDefault(); handleClick(); }}
            className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white ${className}`}
        >
            {children}
        </a>
    );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div className="border-t border-gray-700 my-1" />;
};