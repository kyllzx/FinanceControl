
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card } from '../components/Card';
import { FinancialGoals, UserPreferences, ExpenseCategory, Theme } from '../types';
import { DEFAULT_CURRENCY, EXPENSE_CATEGORIES_OPTIONS } from '../constants';
import { UserIcon, GoalIcon, SettingsIcon } from '../components/icons';

const defaultNumericGoals: FinancialGoals = {
  monthlyIncomeTarget: 5000,
  monthlyExpenseLimit: 3000,
  savingsTarget: 1000,
};

const goalsToDisplayStrings = (goals: FinancialGoals | undefined | null): Record<keyof FinancialGoals, string> => ({
    monthlyIncomeTarget: (goals?.monthlyIncomeTarget ?? defaultNumericGoals.monthlyIncomeTarget).toString(),
    monthlyExpenseLimit: (goals?.monthlyExpenseLimit ?? defaultNumericGoals.monthlyExpenseLimit).toString(),
    savingsTarget: (goals?.savingsTarget ?? defaultNumericGoals.savingsTarget).toString(),
});


export const ProfileSetupPage: React.FC = () => {
  const { user, completeProfileSetup, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [financialGoals, setFinancialGoals] = useState<FinancialGoals>(
    user?.financialGoals || defaultNumericGoals
  );
  const [displayGoals, setDisplayGoals] = useState<Record<keyof FinancialGoals, string>>(
    goalsToDisplayStrings(user?.financialGoals)
  );
  const [preferences, setPreferences] = useState<UserPreferences>(
    user?.preferences || {
      currency: DEFAULT_CURRENCY,
      notificationsEnabled: true,
      theme: 'light',
      favoriteExpenseCategories: [],
    }
  );

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      const currentGoals = user.financialGoals || defaultNumericGoals;
      setFinancialGoals(currentGoals);
      setDisplayGoals(goalsToDisplayStrings(currentGoals));
      setPreferences(user.preferences || { currency: DEFAULT_CURRENCY, notificationsEnabled: true, theme: 'light', favoriteExpenseCategories: [] });
    }
  }, [user]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof FinancialGoals; value: string };
    
    setDisplayGoals(prev => ({ ...prev, [name]: value }));

    if (value === '') {
      setFinancialGoals(prev => ({ ...prev, [name]: 0 }));
    } else {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setFinancialGoals(prev => ({ ...prev, [name]: num }));
      }
      // If num is NaN, financialGoals[name] retains its previous valid value.
    }
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setPreferences({ ...preferences, [name]: checked });
    } else {
       setPreferences({ ...preferences, [name]: value as Theme | string }); // Cast for theme
    }
  };
  
  const handleFavoriteCategoriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value as ExpenseCategory);
    setPreferences({ ...preferences, favoriteExpenseCategories: selectedOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Ensure financialGoals are up-to-date from displayGoals before saving
    const finalNumericGoals: FinancialGoals = {
        monthlyIncomeTarget: parseFloat(displayGoals.monthlyIncomeTarget) || 0,
        monthlyExpenseLimit: parseFloat(displayGoals.monthlyExpenseLimit) || 0,
        savingsTarget: parseFloat(displayGoals.savingsTarget) || 0,
    };

    // Call completeProfileSetup which internally calls updateUser
    completeProfileSetup(finalNumericGoals, preferences);
    
    // Update name if it has changed
    if(name !== user.name) {
        updateUser({ name: name || user.email.split('@')[0] });
    }
    
    navigate('/dashboard');
  };
  
  if (isLoading || !user) {
    return <div className="flex justify-center items-center h-screen"><p className="text-slate-700 dark:text-slate-300">Carregando perfil...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {user.profileCompleted ? 'Atualizar Perfil' : 'Configuração do Perfil'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {user.profileCompleted ? 'Ajuste suas metas e preferências.' : 'Vamos configurar suas metas financeiras e preferências.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card title="Informações Pessoais" className="shadow-lg">
            <Input
              label="Nome"
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </Card>

          <Card title="Metas Financeiras" className="shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={`Meta de Receita Mensal (${preferences.currency})`}
                id="monthlyIncomeTarget"
                name="monthlyIncomeTarget"
                type="text" // Changed to text
                value={displayGoals.monthlyIncomeTarget}
                onChange={handleGoalChange}
                placeholder="Ex: 5000"
                inputMode="decimal"
              />
              <Input
                label={`Limite de Gastos Mensais (${preferences.currency})`}
                id="monthlyExpenseLimit"
                name="monthlyExpenseLimit"
                type="text" // Changed to text
                value={displayGoals.monthlyExpenseLimit}
                onChange={handleGoalChange}
                placeholder="Ex: 3000"
                inputMode="decimal"
              />
              <Input
                label={`Meta de Poupança Mensal (${preferences.currency})`}
                id="savingsTarget"
                name="savingsTarget"
                type="text" // Changed to text
                value={displayGoals.savingsTarget}
                onChange={handleGoalChange}
                placeholder="Ex: 1000"
                inputMode="decimal"
              />
            </div>
          </Card>

          <Card title="Preferências" className="shadow-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Moeda Principal"
                  id="currency"
                  name="currency"
                  value={preferences.currency}
                  onChange={handlePreferenceChange}
                  options={[{ value: 'BRL', label: 'Real Brasileiro (BRL)' }, { value: 'USD', label: 'Dólar Americano (USD)' }, { value: 'EUR', label: 'Euro (EUR)' }]}
                />
                 <Select
                  label="Tema"
                  id="theme"
                  name="theme"
                  value={preferences.theme}
                  onChange={handlePreferenceChange}
                  options={[{value: 'light', label: 'Claro'}, {value: 'dark', label: 'Escuro'}]}
                />
             </div>
            <div className="mt-4">
              <label htmlFor="favoriteExpenseCategories" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categorias de Despesa Favoritas (selecione múltiplas)</label>
              <select
                id="favoriteExpenseCategories"
                name="favoriteExpenseCategories"
                multiple
                value={preferences.favoriteExpenseCategories}
                onChange={handleFavoriteCategoriesChange}
                className="block w-full h-32 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {EXPENSE_CATEGORIES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700">{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor="notificationsEnabled" className="flex items-center">
                <input
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  type="checkbox"
                  checked={preferences.notificationsEnabled}
                  onChange={handlePreferenceChange}
                  className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Ativar notificações (em breve)</span>
              </label>
            </div>
          </Card>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}
              leftIcon={user.profileCompleted ? <SettingsIcon /> : <GoalIcon />}>
              {user.profileCompleted ? 'Salvar Alterações' : 'Concluir Configuração e Ir para Dashboard'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
