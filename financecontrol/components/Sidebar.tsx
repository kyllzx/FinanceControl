
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, TrendingUpIcon, ArchiveIcon, GoalIcon } from './icons';
import { APP_NAME } from '../constants';

const navigationItems = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { name: 'Adicionar Transação', to: '/add-transaction', icon: PlusCircleIcon },
  { name: 'Relatórios', to: '/reports', icon: TrendingUpIcon },
  { name: 'Orçamentos', to: '/budgets', icon: ArchiveIcon },
  { name: 'Metas', to: '/goals', icon: GoalIcon },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-slate-900 dark:bg-slate-950 text-slate-200 dark:text-slate-300 flex flex-col min-h-screen transition-colors duration-300">
      <div className="h-16 flex items-center justify-center border-b border-slate-700 dark:border-slate-800">
        <span className="text-2xl font-bold text-white">{APP_NAME}</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                : 'hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} {APP_NAME}
      </div>
    </div>
  );
};
