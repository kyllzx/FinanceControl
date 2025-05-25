
import React, { useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TransactionType, FinancialGoals } from '../types';
import { formatCurrency } from '../utils/formatters';
import { GoalIcon, CheckCircleIcon, AlertTriangleIcon, EditIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';
import { getMonth, getYear, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { transactions, isLoadingData } = useData();
  const navigate = useNavigate();

  const financialGoals = user?.financialGoals;
  const currency = user?.preferences?.currency || 'BRL';

  const currentMonthProgress = useMemo(() => {
    if (!financialGoals || !user) return null;

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date); // Use new Date() for robust parsing
        return t.userEmail === user.email && isWithinInterval(tDate, { start: currentMonthStart, end: currentMonthEnd });
    });

    const incomeThisMonth = currentMonthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expensesThisMonth = currentMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const potentialSavingsThisMonth = incomeThisMonth - expensesThisMonth;

    return {
      income: {
        current: incomeThisMonth,
        target: financialGoals.monthlyIncomeTarget,
        progress: financialGoals.monthlyIncomeTarget > 0 ? (incomeThisMonth / financialGoals.monthlyIncomeTarget) * 100 : 0,
      },
      expenses: {
        current: expensesThisMonth,
        target: financialGoals.monthlyExpenseLimit,
        progress: financialGoals.monthlyExpenseLimit > 0 ? (expensesThisMonth / financialGoals.monthlyExpenseLimit) * 100 : 0,
      },
      savings: {
        current: potentialSavingsThisMonth > 0 ? potentialSavingsThisMonth : 0,
        target: financialGoals.savingsTarget,
        progress: financialGoals.savingsTarget > 0 && potentialSavingsThisMonth > 0 ? (potentialSavingsThisMonth / financialGoals.savingsTarget) * 100 : 0,
      }
    };
  }, [financialGoals, transactions, user]);

  if (isLoadingData || !user) {
    return <Layout pageTitle="Metas Financeiras"><div className="flex justify-center items-center h-full"><p className="text-slate-700 dark:text-slate-300">Carregando metas...</p></div></Layout>;
  }

  if (!financialGoals || 
      (financialGoals.monthlyIncomeTarget === 0 && financialGoals.monthlyExpenseLimit === 0 && financialGoals.savingsTarget === 0)) {
    return (
      <Layout pageTitle="Metas Financeiras">
        <Card className="text-center">
          <GoalIcon className="mx-auto h-16 w-16 text-indigo-400 dark:text-indigo-500 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Nenhuma Meta Definida</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Você ainda não configurou suas metas financeiras.</p>
          <Button variant="primary" onClick={() => navigate('/profile-setup')} leftIcon={<EditIcon />}>
            Configurar Metas Agora
          </Button>
        </Card>
      </Layout>
    );
  }

  const renderGoalProgress = (
    title: string, 
    current: number, 
    target: number, 
    progress: number, 
    isExpenseGoal: boolean = false
  ) => {
    const achieved = isExpenseGoal ? current <= target : current >= target;
    const progressBarColor = achieved ? 'bg-green-500 dark:bg-green-400' : (progress > 75 && !isExpenseGoal) || (progress < 25 && isExpenseGoal && progress > 0) ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400';
    const displayProgress = Math.min(Math.max(progress,0), 100);

    if (target === 0 && !isExpenseGoal) return null; // Don't display if target is 0 unless it's an expense goal (limit 0 is valid)

    return (
      <div className="p-4 border dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
          {achieved && !isExpenseGoal && <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />}
          {isExpenseGoal && current > target && target > 0 && <AlertTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />}
          {isExpenseGoal && current <= target && <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isExpenseGoal ? "Gasto" : "Atual"}: {formatCurrency(current, currency)} / Meta: {formatCurrency(target, currency)}
        </p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mt-2">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${displayProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">{displayProgress.toFixed(0)}% {isExpenseGoal ? 'do limite utilizado' : 'alcançado'}</p>
      </div>
    );
  };

  return (
    <Layout pageTitle="Metas Financeiras">
      <div className="space-y-6">
        <Card title="Progresso das Metas Mensais" actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/profile-setup')} leftIcon={<EditIcon />}>
            Editar Metas
          </Button>
        }>
          {currentMonthProgress ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderGoalProgress("Receita Mensal", currentMonthProgress.income.current, currentMonthProgress.income.target, currentMonthProgress.income.progress)}
              {renderGoalProgress("Limite de Gastos", currentMonthProgress.expenses.current, currentMonthProgress.expenses.target, currentMonthProgress.expenses.progress, true)}
              {renderGoalProgress("Poupança Mensal", currentMonthProgress.savings.current, currentMonthProgress.savings.target, currentMonthProgress.savings.progress)}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Não foi possível calcular o progresso das metas.</p>
          )}
        </Card>
        
        <Card title="Dicas e Observações">
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li>Revise suas metas regularmente para garantir que ainda são relevantes.</li>
                <li>Acompanhe seus gastos para identificar áreas onde você pode economizar.</li>
                <li>Celebre pequenas vitórias ao atingir marcos em suas metas!</li>
                {currentMonthProgress && financialGoals && currentMonthProgress.income.current < financialGoals.monthlyIncomeTarget && financialGoals.monthlyIncomeTarget > 0 &&
                    <li>Dica: Explore formas de aumentar sua receita este mês para atingir sua meta.</li>
                }
                {currentMonthProgress && financialGoals && currentMonthProgress.expenses.current > financialGoals.monthlyExpenseLimit && financialGoals.monthlyExpenseLimit > 0 &&
                    <li>Atenção: Seus gastos estão acima do limite. Tente identificar despesas não essenciais.</li>
                }
            </ul>
        </Card>
      </div>
    </Layout>
  );
};
