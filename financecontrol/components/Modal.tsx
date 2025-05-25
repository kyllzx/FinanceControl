
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-slate-700/50 transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full"> {/* Removed sm:ml-4 as it can make title off-center if no icon */}
                {title && <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100" id="modal-title">{title}</h3>}
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {children}
                </div>
              </div>
            </div>
          </div>
          {footer && (
            <div className="bg-slate-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
