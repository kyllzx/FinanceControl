
import React from 'react';
import { OptionType } from '../types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: OptionType[];
  error?: string;
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, options, error, containerClassName, className, ...props }) => {
  return (
    <div className={`w-full ${containerClassName || ''}`}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <select
        id={id || props.name}
        className={`block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : ''} ${className || ''}`}
        {...props}
      >
        <option value="" className="text-slate-500 dark:text-slate-400">Selecione...</option>
        {options.map(option => (
          // Individual option styling is tricky; rely on select's text color and browser defaults.
          // The global style in index.html provides a fallback.
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
