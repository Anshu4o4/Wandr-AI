import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/25',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-secondary-50 shadow-sm',
  outline: 'border border-primary-200 text-primary-700 hover:bg-primary-50 bg-white',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  premium: 'bg-gradient-to-r from-primary-900 via-primary-700 to-secondary-500 text-white shadow-xl shadow-primary-900/15 hover:shadow-2xl',
};

const sizes = {
  sm: 'min-h-11 px-3 py-2 text-xs',
  md: 'min-h-11 px-4 py-3 text-sm',
  lg: 'min-h-11 px-6 py-3 text-base',
  icon: 'min-h-11 min-w-11 p-2',
};

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  disabled,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium leading-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg aria-hidden="true" focusable="false" className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
