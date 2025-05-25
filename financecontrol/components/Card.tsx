
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, actions }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/50 rounded-xl overflow-hidden transition-colors duration-300 ${className || ''}`}>
      {(title || actions) && (
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};
