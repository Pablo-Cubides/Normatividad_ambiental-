import React from 'react';

export const Badge: React.FC<React.PropsWithChildren<{ variant?: string; className?: string }>> = ({ children, className }) => (
  <span className={className}>{children}</span>
);

export default Badge;
