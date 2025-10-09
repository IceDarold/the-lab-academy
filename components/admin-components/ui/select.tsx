
import * as React from 'react';
import { ChevronDown } from 'lucide-react';

const SelectContext = React.createContext({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => {},
  selectedValue: '',
  setSelectedValue: (value: string) => {},
  triggerText: '',
  setTriggerText: (text: string) => {},
});

export const Select: React.FC<{ children: React.ReactNode; onValueChange?: (value: string) => void; defaultValue?: string }> = ({ children, onValueChange, defaultValue = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(defaultValue);
  const [triggerText, setTriggerText] = React.useState('');

  React.useEffect(() => {
    if (onValueChange && selectedValue) {
      onValueChange(selectedValue);
    }
  }, [selectedValue, onValueChange]);

  return (
    <SelectContext.Provider value={{ isOpen, setIsOpen, selectedValue, setSelectedValue, triggerText, setTriggerText }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm ring-offset-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full ${className}`}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { selectedValue, triggerText } = React.useContext(SelectContext);
  return <span className="truncate">{triggerText || selectedValue || placeholder}</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
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

  return (
    <div ref={contentRef} className="absolute z-50 mt-1 w-full rounded-md border border-gray-700 bg-gray-800 text-gray-50 shadow-md">
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem: React.FC<{ children: React.ReactNode; value: string }> = ({ children, value }) => {
  const { setIsOpen, setSelectedValue, setTriggerText, selectedValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    setSelectedValue(value);
    setTriggerText(children as string);
    setIsOpen(false);
  };
  
  return (
    <div
      onClick={handleClick}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-700 ${isSelected ? 'font-bold' : ''}`}
    >
      {children}
    </div>
  );
};