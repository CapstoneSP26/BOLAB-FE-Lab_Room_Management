import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  rightElement,
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full space-y-1.5 group">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 transition-colors group-focus-within:text-brand-600">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            block w-full rounded-lg shadow-sm sm:text-sm 
            bg-gray-50 focus:bg-white
            transition-all duration-200 ease-in-out
            border py-2.5 
            ${icon ? 'pl-10' : 'pl-3'}
            ${rightElement ? 'pr-10' : 'pr-3'}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-200 hover:border-gray-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
            }
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
           <span className="w-1 h-1 rounded-full bg-red-600 inline-block"/>
           {error}
        </p>
      )}
    </div>
  );
};
