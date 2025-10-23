import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantStyles: Record<string, string> = {
  default: 'bg-blue-600 text-white',
  secondary: 'bg-gray-200 text-gray-900',
  destructive: 'bg-red-600 text-white',
  outline: 'border border-gray-300 text-gray-900 bg-white',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantStyle = variantStyles[variant] || variantStyles.default;
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyle} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
export default Badge;
