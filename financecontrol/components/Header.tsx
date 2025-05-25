
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { LogOutIcon, UserIcon, SettingsIcon } from './icons';
import { useNavigate } from 'react-router-dom';
import { ThemeToggler } from './ThemeToggler'; // Import ThemeToggler

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile-setup'); 
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-700/50 h-16 flex items-center justify-between px-6 transition-colors duration-300">
      <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{title}</h1>
      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <span>{user.name || user.email}</span>
          </div>
        )}
        <ThemeToggler /> 
         <Button variant="ghost" size="sm" onClick={handleProfile} aria-label="Configurações do Perfil" className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
          <SettingsIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOutIcon className="h-5 w-5" />} aria-label="Sair" className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
          Sair
        </Button>
      </div>
    </header>
  );
};
