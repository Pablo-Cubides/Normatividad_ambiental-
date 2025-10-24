'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select provider');
  }
  return context;
};

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

function Select({ value = '', onValueChange, children, disabled = false }: SelectProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    setIsOpen(false);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider
      value={{
        value: internalValue,
        onValueChange: handleValueChange,
        isOpen,
        setIsOpen,
        containerRef,
        disabled,
      }}
    >
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className = '', children, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSelectContext();

    return (
      <div
        ref={ref}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded border border-gray-300 bg-white px-3 py-2 text-base cursor-pointer flex items-center justify-between ${className}`}
        {...props}
      >
        {children}
        <span className={`text-gray-400 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext();
  return <span className="text-gray-700">{value || placeholder}</span>;
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className = '', children, ...props }, ref) => {
    const { isOpen } = useSelectContext();

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={`absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md ${className}`}
        {...props}
      >
        <div className="overflow-y-auto max-h-64">{children}</div>
      </div>
    );
  }
);

SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className = '', onClick, ...props }, ref) => {
    const { onValueChange } = useSelectContext();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onValueChange(value);
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={`cursor-pointer px-2 py-1.5 text-sm hover:bg-gray-100 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
export default Select;
