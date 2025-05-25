
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginPage } from './pages/LoginPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddTransactionPage } from './pages/AddTransactionPage';
import { ReportsPage } from './pages/ReportsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';

const ThemeApplicator: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, isLoading } = useAuth(); // Get isLoading state

  useEffect(() => {
    // Wait for auth loading to complete before applying theme based on user
    // to avoid flicker or applying default before user prefs are known.
    if (isLoading) {
      // You could set a very basic default here, or do nothing until loaded.
      // For example, ensure 'dark' is not present if you prefer light as the absolute default during load.
      // document.documentElement.classList.remove('dark');
      return;
    }

    const themeToApply = user?.preferences?.theme || 'light'; // Default to light if no user or no theme pref

    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.preferences?.theme, isLoading]); // Re-run if theme or loading state changes

  return <>{children}</>;
};


const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-slate-700 dark:text-slate-300">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.profileCompleted && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <ThemeApplicator> {/* Wrap router with ThemeApplicator */}
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile-setup" element={
                  <AuthWrapperForProfileSetup>
                      <ProfileSetupPage />
                  </AuthWrapperForProfileSetup>
              } />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/add-transaction" element={<AddTransactionPage />} />
                <Route path="/add-transaction/:transactionId" element={<AddTransactionPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </ThemeApplicator>
      </DataProvider>
    </AuthProvider>
  );
};

const AuthWrapperForProfileSetup: React.FC<{children: React.ReactNode}> = ({children}) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-xl font-semibold text-slate-700 dark:text-slate-300">Carregando...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
}

export default App;
