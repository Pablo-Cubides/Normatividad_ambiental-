import React from 'react';

export const Button: React.FC<React.PropsWithChildren<{ className?: string; variant?: string; size?: string; asChild?: boolean; onClick?: () => void }>> = ({ children, className, onClick }) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export default Button;
