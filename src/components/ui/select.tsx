import React from 'react';

export const Select: React.FC<React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void; disabled?: boolean }>> = ({ children, value, onValueChange, disabled }) => {
  return (
    <div>
      {/* Expect children to include SelectTrigger/SelectContent in original code; for simplicity, render native select when items are provided */}
      {children}
    </div>
  );
};

export const SelectTrigger: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => <div className={className}>{children}</div>;
export const SelectContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => <div className={className}>{children}</div>;
export const SelectItem: React.FC<React.PropsWithChildren<{ value?: string; className?: string }>> = ({ children, className }) => <div className={className}>{children}</div>;
export const SelectValue: React.FC<React.PropsWithChildren<{ placeholder?: string; className?: string }>> = ({ children, className }) => <span className={className}>{children}</span>;

export default Select;
