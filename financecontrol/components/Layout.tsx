
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, pageTitle }) => {
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-850 transition-colors duration-300"> {/* Using a custom -850 if needed or stick to -800/-900 */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-900 p-6 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
