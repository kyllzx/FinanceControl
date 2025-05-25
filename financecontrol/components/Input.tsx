
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, id, error, containerClassName, className, leftIcon, ...props }) => {
  return (
    <div className={`w-full ${containerClassName || ''}`}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500`}>
            {leftIcon}
          </span>
        )}
        <input
          id={id || props.name}
          className={`block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : ''} ${leftIcon ? 'pl-10' : ''} ${className || ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, error, containerClassName, className, ...props }) => {
  return (
    <div className={`w-full ${containerClassName || ''}`}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <textarea
        id={id || props.name}
        className={`block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : ''} ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
