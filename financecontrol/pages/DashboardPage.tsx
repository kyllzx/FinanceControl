
import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Transaction, TransactionType, MonthlyInOutChartData, CategoryChartData, Budget, ExpenseCategory } from '../types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { PlusCircleIcon, EyeIcon, EyeOffIcon, FilterIcon, SearchIcon, AlertTriangleIcon, CheckCircleIcon, EditIcon, TrashIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MONTHS_PT, CHART_COLORS, ALL_CATEGORIES_MAP, EXPENSE_CATEGORIES_OPTIONS } from '../constants';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { getMonth, getYear, parseISO, subMonths, format as formatDateFns } from 'date-fns';


const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const yearOptions = Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));
const monthOptions = MONTHS_PT.map((name, i) => ({ value: (i + 1).toString(), label: name }));

const BudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    budgetToEdit?: Budget | null;
    selectedMonth: number;
    selectedYear: number;
}> = ({ isOpen, onClose, budgetToEdit, selectedMonth, selectedYear }) => {
    const { addBudget, updateBudget } = useData();
    const { user } = useAuth();
    const [category, setCategory] = useState<ExpenseCategory | ''>(budgetToEdit?.category || '');
    const [limit, setLimit] = useState<number>(budgetToEdit?.monthlyLimit || 0);
    const [limitDisplay, setLimitDisplay] = useState<string>((budgetToEdit?.monthlyLimit || 0).toString());
    const [alerts, setAlerts] = useState<boolean>(budgetToEdit?.alertsEnabled !== undefined ? budgetToEdit.alertsEnabled : true);

    useEffect(() => {
        if (budgetToEdit) {
            setCategory(budgetToEdit.category);
            setLimit(budgetToEdit.monthlyLimit);
            setLimitDisplay(budgetToEdit.monthlyLimit.toString());
            setAlerts(budgetToEdit.alertsEnabled);
        } else {
            setCategory('');
            setLimit(0);
            setLimitDisplay("0");
            setAlerts(true);
        }
    }, [budgetToEdit, isOpen]);

    const handleSubmit = () => {
        const finalLimit = parseFloat(limitDisplay);
        if (isNaN(finalLimit)) {
            alert("O limite do orçamento é inválido.");
            return;
        }
        if (!category || finalLimit <= 0 || !user) {
            alert("Por favor, preencha a categoria e um limite válido.");
            return;
        }
        const budgetData = {
            category,
            monthlyLimit: finalLimit,
            month: selectedMonth,
            year: selectedYear,
            alertsEnabled: alerts,
        };
        if (budgetToEdit) {
            updateBudget({ ...budgetData, id: budgetToEdit.id, userEmail: user.email });
        } else {
            addBudget(budgetData);
        }
        onClose();
    };
    
    const expenseCategoryOptions = EXPENSE_CATEGORIES_OPTIONS.map(opt => ({ value: opt.value as ExpenseCategory, label: opt.label}));


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={budgetToEdit ? "Editar Orçamento" : "Novo Orçamento"}>
            <div className="space-y-4">
                <Select 
                    label="Categoria" 
                    options={expenseCategoryOptions} 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)} 
                />
                <Input 
                    label="Limite Mensal" 
                    type="text" // Changed to text
                    value={limitDisplay} 
                    onChange={(e) => {
                        setLimitDisplay(e.target.value);
                        if (e.target.value === '') {
                            setLimit(0);
                        } else {
                            const num = parseFloat(e.target.value);
                            if (!isNaN(num)) {
                                setLimit(num);
                            }
                        }
                    }}
                    inputMode="decimal"
                    placeholder="0.00"
                />
                <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 dark:text-indigo-500 border-slate-300 dark:border-slate-600 rounded"/>
                    <span className="text-slate-700 dark:text-slate-300">Ativar Alertas</span>
                </label>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleSubmit}>{budgetToEdit ? "Salvar" : "Adicionar"}</Button>
            </div>
        </Modal>
    );
};


export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { getTransactionsByMonthYear, transactions, budgets, getBudgetsByMonthYear, deleteBudget, isLoadingData } = useData();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [showValues, setShowValues] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  
  const currentTheme = user?.preferences?.theme || 'light';


  const monthlyTransactions = useMemo(() => {
    const allMonthTransactions = getTransactionsByMonthYear(selectedMonth, selectedYear);
    if (!searchTerm) return allMonthTransactions;
    return allMonthTransactions.filter(t => 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ALL_CATEGORIES_MAP[t.category]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [getTransactionsByMonthYear, selectedMonth, selectedYear, searchTerm]);

  const monthlyBudgets = useMemo(() => {
    return getBudgetsByMonthYear(selectedMonth, selectedYear);
  }, [getBudgetsByMonthYear, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    const income = monthlyTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: monthlyTransactions.length,
    };
  }, [monthlyTransactions]);

  const monthlyChartData: MonthlyInOutChartData[] = useMemo(() => [
    { month: getMonthName(selectedMonth), Receita: summary.income, Despesa: summary.expenses }
  ], [selectedMonth, summary.income, summary.expenses]);

  const expenseCategoryData: CategoryChartData[] = useMemo(() => {
    const expenseByCategory: { [key: string]: number } = {};
    monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      });
    return Object.entries(expenseByCategory).map(([name, value], index) => ({
      name: ALL_CATEGORIES_MAP[name as ExpenseCategory] || name,
      value,
      fill: CHART_COLORS.categories[index % CHART_COLORS.categories.length]
    }));
  }, [monthlyTransactions]);

  const financialGoals = user?.financialGoals;
  const incomeGoalReached = financialGoals && summary.income >= financialGoals.monthlyIncomeTarget;
  const expenseLimitExceeded = financialGoals && summary.expenses > financialGoals.monthlyExpenseLimit;

  if (!user || isLoadingData) {
    return <Layout pageTitle="Dashboard"><div className="flex justify-center items-center h-full"><p className="text-slate-700 dark:text-slate-300">Carregando dashboard...</p></div></Layout>;
  }

  const handleOpenBudgetModal = (budget?: Budget) => {
    setBudgetToEdit(budget || null);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    if(window.confirm("Tem certeza que deseja excluir este orçamento?")) {
      deleteBudget(budgetId);
    }
  }
  
  const chartAxisColor = currentTheme === 'dark' ? '#9ca3af' : '#6b7280'; // gray-400 / gray-500
  const chartGridColor = currentTheme === 'dark' ? '#4b5563' : '#e5e7eb'; // gray-600 / gray-200


  return (
    <Layout pageTitle={`Dashboard - ${getMonthName(selectedMonth)}/${selectedYear}`}>
      <div className="space-y-6">
        {/* Filters and Greeting */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Olá, {user.name || user.email.split('@')[0]}!</h2>
            <p className="text-slate-500 dark:text-slate-400">Aqui está o resumo financeiro de {getMonthName(selectedMonth)} de {selectedYear}.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select options={monthOptions} value={selectedMonth.toString()} onChange={e => setSelectedMonth(parseInt(e.target.value))} containerClassName="w-36"/>
            <Select options={yearOptions} value={selectedYear.toString()} onChange={e => setSelectedYear(parseInt(e.target.value))} containerClassName="w-28"/>
            <Button variant="ghost" onClick={() => setShowValues(!showValues)} aria-label={showValues ? "Ocultar valores" : "Mostrar valores"} className="text-slate-600 dark:text-slate-400">
              {showValues ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </Button>
             <Button variant="primary" onClick={() => navigate('/add-transaction')} leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-green-500 dark:bg-green-600 text-white">
            <h4 className="font-semibold text-lg">Receitas</h4>
            <p className="text-3xl font-bold">{showValues ? formatCurrency(summary.income, user.preferences?.currency) : '*****'}</p>
          </Card>
          <Card className="bg-red-500 dark:bg-red-600 text-white">
            <h4 className="font-semibold text-lg">Despesas</h4>
            <p className="text-3xl font-bold">{showValues ? formatCurrency(summary.expenses, user.preferences?.currency) : '*****'}</p>
          </Card>
          <Card className={`${summary.balance >= 0 ? 'bg-blue-500 dark:bg-blue-600' : 'bg-orange-500 dark:bg-orange-600'} text-white`}>
            <h4 className="font-semibold text-lg">Saldo</h4>
            <p className="text-3xl font-bold">{showValues ? formatCurrency(summary.balance, user.preferences?.currency) : '*****'}</p>
          </Card>
          <Card className="bg-slate-700 dark:bg-slate-600 text-white">
            <h4 className="font-semibold text-lg">Transações</h4>
            <p className="text-3xl font-bold">{summary.transactionCount}</p>
          </Card>
        </div>
        
        {/* Goal Alerts */}
        {financialGoals && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incomeGoalReached && financialGoals.monthlyIncomeTarget > 0 && (
              <Card className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 dark:border-green-400">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mr-3"/>
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">Meta de Receita Atingida!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Parabéns! Você alcançou sua meta de {formatCurrency(financialGoals.monthlyIncomeTarget, user.preferences?.currency)}.</p>
                  </div>
                </div>
              </Card>
            )}
            {expenseLimitExceeded && financialGoals.monthlyExpenseLimit > 0 && (
              <Card className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-400">
                 <div className="flex items-center">
                  <AlertTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400 mr-3"/>
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-300">Limite de Gastos Excedido!</p>
                    <p className="text-sm text-red-600 dark:text-red-400">Você ultrapassou seu limite de {formatCurrency(financialGoals.monthlyExpenseLimit, user.preferences?.currency)}.</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Receitas vs. Despesas">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="month" tick={{ fill: chartAxisColor }} />
                <YAxis tickFormatter={(value) => formatCurrency(value, user.preferences?.currency).replace(user.preferences?.currency || "R$", "")} tick={{ fill: chartAxisColor }} />
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value, user.preferences?.currency)}
                    contentStyle={{ backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff', border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`}}
                    labelStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                    itemStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                 />
                <Legend wrapperStyle={{ color: chartAxisColor }} />
                <Bar dataKey="Receita" fill={CHART_COLORS.income} />
                <Bar dataKey="Despesa" fill={CHART_COLORS.expense} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Distribuição de Despesas por Categoria">
            {expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} 
                       labelLine={{stroke: chartAxisColor}} 
                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                       tick={{ fill: chartAxisColor }}
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, user.preferences?.currency)}
                    contentStyle={{ backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff', border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`}}
                    labelStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                    itemStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                  />
                  <Legend wrapperStyle={{ color: chartAxisColor }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 dark:text-slate-400 text-center py-10">Nenhuma despesa registrada para este mês.</p>}
          </Card>
        </div>

        {/* Budgets Section */}
        <Card title="Orçamentos Mensais" actions={
          <Button variant="outline" size="sm" onClick={() => handleOpenBudgetModal()} leftIcon={<PlusCircleIcon />}>
            Novo Orçamento
          </Button>
        }>
          {monthlyBudgets.length > 0 ? (
            <div className="space-y-4">
              {monthlyBudgets.map(budget => {
                const spent = monthlyTransactions
                  .filter(t => t.type === TransactionType.EXPENSE && t.category === budget.category)
                  .reduce((sum, t) => sum + t.amount, 0);
                const progress = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
                const remaining = budget.monthlyLimit - spent;
                return (
                  <div key={budget.id} className="p-3 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{ALL_CATEGORIES_MAP[budget.category]}</span>
                      <div>
                         <Button variant="ghost" size="sm" onClick={() => handleOpenBudgetModal(budget)} className="mr-1 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><EditIcon className="h-4 w-4"/></Button>
                         <Button variant="ghost" size="sm" onClick={() => handleDeleteBudget(budget.id)} className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"><TrashIcon className="h-4 w-4"/></Button>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${progress > 100 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                      <span>{showValues ? formatCurrency(spent, user.preferences?.currency) : '*****'} de {showValues ? formatCurrency(budget.monthlyLimit, user.preferences?.currency) : '*****'}</span>
                      <span className={remaining < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}>
                        {showValues ? formatCurrency(remaining, user.preferences?.currency) : '*****'} {remaining < 0 ? 'excedido' : 'restante'}
                      </span>
                    </div>
                     {progress > 100 && budget.alertsEnabled && <p className="text-xs text-red-600 dark:text-red-400 mt-1"><AlertTriangleIcon className="inline h-3 w-3 mr-1"/>Limite excedido!</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-6">Nenhum orçamento definido para este mês. <Button variant="ghost" onClick={() => handleOpenBudgetModal()} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Adicionar Orçamento</Button></p>
          )}
        </Card>
        <BudgetModal 
            isOpen={isBudgetModalOpen} 
            onClose={() => setIsBudgetModalOpen(false)} 
            budgetToEdit={budgetToEdit}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
        />

        {/* Transaction List */}
        <Card title="Transações Recentes" actions={
          <div className="flex items-center gap-2">
             <Input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
              className="w-48 sm:w-64 text-sm py-1.5"
              leftIcon={<SearchIcon className="h-4 w-4 text-slate-400 dark:text-slate-500"/>}
            />
          </div>
        }>
          {monthlyTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {monthlyTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => navigate(`/add-transaction/${t.id}`)}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{formatDateFns(parseISO(t.date), 'dd/MM/yy')}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{t.description || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{ALL_CATEGORIES_MAP[t.category] || t.category}</td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-medium ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} {showValues ? formatCurrency(t.amount, user.preferences?.currency) : '*****'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-10">Nenhuma transação registrada para este mês.</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};
