import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', asChild, children, ...props }, ref) => {
  const compClassName = cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
    {
      'bg-royal text-white hover:bg-blue-700': variant === 'default',
      'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
      'border border-slate-300 bg-white hover:bg-slate-100 text-slate-700': variant === 'outline',
      'hover:bg-slate-100 hover:text-slate-900 text-slate-700': variant === 'ghost',
      'bg-blue-50 text-royal hover:bg-blue-100': variant === 'secondary',
      'h-10 py-2 px-4': size === 'default',
      'h-9 px-3 rounded-md': size === 'sm',
      'h-11 px-8 rounded-md': size === 'lg',
    },
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      className: cn(compClassName, children.props.className),
    });
  }

  return (
    <button
      ref={ref}
      className={compClassName}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export { Button };
