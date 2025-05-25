
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { Sun, Moon } from 'lucide-react'; // Assuming these are available in your icons setup

export const ThemeToggler: React.FC = () => {
  const { user, toggleTheme } = useAuth();
  const currentTheme = user?.preferences?.theme || 'light';

  if (!user) return null; // Or some placeholder/disabled state

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      className="p-2"
    >
      {currentTheme === 'light' ? (
        <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      ) : (
        <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      )}
    </Button>
  );
};
