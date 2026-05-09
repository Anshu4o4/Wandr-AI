import React, { useId } from 'react';
import { cn } from './Button'; // Reusing cn utility

export const Input = React.forwardRef(({ 
  className, 
  label, 
  error, 
  id, 
  ...props 
}, ref) => {
  const reactId = useId();
  const generatedId = id || `input-${reactId}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={generatedId} className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={generatedId}
        className={cn(
           "premium-input block min-h-11 sm:text-sm",
          error && "border-red-300 text-red-900 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.14)]",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
