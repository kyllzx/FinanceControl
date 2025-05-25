
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, FinancialGoals, UserPreferences, Theme } from '../types';
import { DEFAULT_CURRENCY } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  completeProfileSetup: (goals: FinancialGoals, preferences: UserPreferences) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUserPreferences: UserPreferences = {
  currency: DEFAULT_CURRENCY,
  notificationsEnabled: true,
  theme: 'light',
  favoriteExpenseCategories: [],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserJson = localStorage.getItem('financeControlUser');
    if (storedUserJson) {
      const parsedUser = JSON.parse(storedUserJson) as User;
      
      // Robust preferences initialization
      if (!parsedUser.preferences) {
        parsedUser.preferences = { ...defaultUserPreferences };
      } else {
        parsedUser.preferences.theme = parsedUser.preferences.theme || 'light';
        parsedUser.preferences.currency = parsedUser.preferences.currency || DEFAULT_CURRENCY;
        parsedUser.preferences.notificationsEnabled = parsedUser.preferences.notificationsEnabled !== undefined ? parsedUser.preferences.notificationsEnabled : true;
        parsedUser.preferences.favoriteExpenseCategories = parsedUser.preferences.favoriteExpenseCategories || [];
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, name?: string) => {
    setIsLoading(true);
    // Simulate API call / user lookup
    setTimeout(() => {
      let existingUserJson = localStorage.getItem(`financeControlUser_${email}`);
      let loggedInUser: User;

      if (existingUserJson) {
        loggedInUser = JSON.parse(existingUserJson) as User;
        // Robust preferences initialization for existing user
        if (!loggedInUser.preferences) {
          loggedInUser.preferences = { ...defaultUserPreferences };
        } else {
          loggedInUser.preferences.theme = loggedInUser.preferences.theme || 'light';
          loggedInUser.preferences.currency = loggedInUser.preferences.currency || DEFAULT_CURRENCY;
          loggedInUser.preferences.notificationsEnabled = loggedInUser.preferences.notificationsEnabled !== undefined ? loggedInUser.preferences.notificationsEnabled : true;
          loggedInUser.preferences.favoriteExpenseCategories = loggedInUser.preferences.favoriteExpenseCategories || [];
        }
      } else {
        // New user setup
        loggedInUser = {
          id: email,
          email,
          name: name || email.split('@')[0],
          profileCompleted: false,
          preferences: { ...defaultUserPreferences }, // Use defaults
          financialGoals: {
            monthlyIncomeTarget: 0,
            monthlyExpenseLimit: 0,
            savingsTarget: 0,
          }
        };
      }
      
      loggedInUser.lastLogin = new Date().toISOString();
      setUser(loggedInUser);
      localStorage.setItem('financeControlUser', JSON.stringify(loggedInUser));
      localStorage.setItem(`financeControlUser_${loggedInUser.email}`, JSON.stringify(loggedInUser));
      setIsLoading(false);
    }, 500);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('financeControlUser');
    // document.documentElement.classList.remove('dark'); // ThemeApplicator will handle this
  }, []);
  
  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const currentPreferences = prevUser.preferences || { ...defaultUserPreferences };

      const newPreferences = updatedUserData.preferences 
        ? { ...currentPreferences, ...updatedUserData.preferences } 
        : currentPreferences;

      const updatedUser = { 
        ...prevUser, 
        ...updatedUserData,
        preferences: newPreferences as UserPreferences
      };
      localStorage.setItem('financeControlUser', JSON.stringify(updatedUser));
      localStorage.setItem(`financeControlUser_${updatedUser.email}`, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const completeProfileSetup = useCallback((goals: FinancialGoals, preferences: UserPreferences) => {
    updateUser({ 
      financialGoals: goals, 
      preferences: preferences, 
      profileCompleted: true 
    });
  }, [updateUser]);

  const toggleTheme = useCallback(() => {
    if (!user || !user.preferences) {
        // This case should be rarer now with better initialization
        return;
    }
    const newTheme = user.preferences.theme === 'light' ? 'dark' : 'light';
    updateUser({
      preferences: {
        ...(user.preferences as UserPreferences),
        theme: newTheme,
      },
    });
  }, [user, updateUser]);


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, completeProfileSetup, updateUser, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
