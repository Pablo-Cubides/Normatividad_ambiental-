import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
  ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200',
  link: 'bg-transparent text-blue-600 hover:text-blue-700 underline',
};

const sizeStyles: Record<string, string> = {
  default: 'px-4 py-2 text-base',
  sm: 'px-3 py-1 text-sm',
  lg: 'px-6 py-3 text-lg',
  icon: 'px-2 py-2',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    props,
    ref
  ) => {
    const {
      className = '',
      variant = 'default',
      size = 'default',
      asChild = false,
      children,
      ...rest
    } = props;
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
    const variantStyle = variantStyles[variant] || variantStyles.default;
    const sizeStyle = sizeStyles[size] || sizeStyles.default;
    const combinedClassName = `${baseStyles} ${variantStyle} ${sizeStyle} ${className}`;

    // If using asChild, clone the child element and inject the button styles + remaining props
    if (asChild && React.isValidElement(children)) {
      const child = React.cloneElement(children, {
        className: `${combinedClassName} ${(children.props as { className?: string }).className ?? ''}`.trim(),
        ...rest,
      });
      return child;
    }

    return (
      <button ref={ref} className={combinedClassName} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
export default Button;
