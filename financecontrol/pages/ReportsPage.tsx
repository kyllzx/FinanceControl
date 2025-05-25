
import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TransactionType, MonthlyInOutChartData, BalanceTrendChartData } from '../types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MONTHS_PT, CHART_COLORS } from '../constants';
import { subMonths, getMonth, getYear, format as formatDateFns, startOfMonth } from 'date-fns';
import { FileTextIcon } from '../components/icons';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const yearOptions = Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));
const monthOptions = MONTHS_PT.map((name, i) => ({ value: (i + 1).toString(), label: name }));

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { getTransactionsByMonthYear, isLoadingData } = useData();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  const currentTheme = user?.preferences?.theme || 'light';

  const selectedMonthTransactions = useMemo(() => {
    return getTransactionsByMonthYear(selectedMonth, selectedYear);
  }, [getTransactionsByMonthYear, selectedMonth, selectedYear]);

  const selectedMonthSummary = useMemo(() => {
    const income = selectedMonthTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expenses = selectedMonthTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: selectedMonthTransactions.length,
    };
  }, [selectedMonthTransactions]);

  const last6MonthsData = useMemo(() => {
    const data: { monthYear: string, income: number, expenses: number, balance: number }[] = [];
    let cumulativeBalance = 0;

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(selectedYear, selectedMonth -1, 1), i);
      const month = getMonth(date) + 1;
      const year = getYear(date);
      const transactions = getTransactionsByMonthYear(month, year);
      
      const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
      const monthBalance = income - expenses;
      
      if (i === 5) cumulativeBalance = monthBalance;
      else cumulativeBalance += monthBalance;

      data.push({
        monthYear: formatDateFns(date, 'MMM/yy'),
        income,
        expenses,
        balance: monthBalance, 
      });
    }
    return data;
  }, [getTransactionsByMonthYear, selectedMonth, selectedYear]);

  const trendChartData: MonthlyInOutChartData[] = last6MonthsData.map(d => ({
    month: d.monthYear,
    Receita: d.income,
    Despesa: d.expenses,
  }));
  
  const balanceTrendData: BalanceTrendChartData[] = last6MonthsData.map(d => ({
    name: d.monthYear,
    Saldo: d.balance,
  }));

  const handleExportCSV = () => {
    if (selectedMonthTransactions.length === 0) {
      alert("Nenhuma transação para exportar neste mês.");
      return;
    }
    const headers = "Data,Tipo,Categoria,Descrição,Valor\n";
    const rows = selectedMonthTransactions.map(t => 
      [
        formatDateFns(new Date(t.date), 'yyyy-MM-dd'),
        t.type,
        t.category,
        `"${t.description?.replace(/"/g, '""') || ''}"`,
        t.amount.toFixed(2)
      ].join(',')
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `transacoes_${selectedMonth}_${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // Removed alert as it was for simulation
  };
  
  if (!user || isLoadingData) {
    return <Layout pageTitle="Relatórios"><div className="flex justify-center items-center h-full"><p className="text-slate-700 dark:text-slate-300">Carregando relatórios...</p></div></Layout>;
  }
  
  const currency = user.preferences?.currency || 'BRL';
  const chartAxisColor = currentTheme === 'dark' ? '#9ca3af' : '#6b7280'; // gray-400 / gray-500
  const chartGridColor = currentTheme === 'dark' ? '#4b5563' : '#e5e7eb'; // gray-600 / gray-200

  return (
    <Layout pageTitle="Relatórios Financeiros">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Filtros do Relatório</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Select options={monthOptions} value={selectedMonth.toString()} onChange={e => setSelectedMonth(parseInt(e.target.value))} containerClassName="w-36"/>
              <Select options={yearOptions} value={selectedYear.toString()} onChange={e => setSelectedYear(parseInt(e.target.value))} containerClassName="w-28"/>
              <Button variant="outline" onClick={handleExportCSV} leftIcon={<FileTextIcon className="h-5 w-5"/>}>
                Exportar CSV
              </Button>
            </div>
          </div>
        </Card>

        <Card title={`Resumo de ${getMonthName(selectedMonth)}/${selectedYear}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-300">Total de Receitas</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedMonthSummary.income, currency)}</p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-300">Total de Despesas</h4>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedMonthSummary.expenses, currency)}</p>
            </div>
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Saldo do Mês</h4>
              <p className={`text-2xl font-bold ${selectedMonthSummary.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>{formatCurrency(selectedMonthSummary.balance, currency)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Total de transações no mês: {selectedMonthSummary.transactionCount}</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Evolução de Receitas e Despesas (Últimos 6 Meses)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
                <XAxis dataKey="month" tick={{ fill: chartAxisColor }} />
                <YAxis tickFormatter={(value) => formatCurrency(value, currency).replace(currency, "")} tick={{ fill: chartAxisColor }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{ backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff', border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`}}
                  labelStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                  itemStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                />
                <Legend wrapperStyle={{ color: chartAxisColor }}/>
                <Bar dataKey="Receita" fill={CHART_COLORS.income} />
                <Bar dataKey="Despesa" fill={CHART_COLORS.expense} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Tendência do Saldo (Últimos 6 Meses)">
             <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
                <XAxis dataKey="name" tick={{ fill: chartAxisColor }}/>
                <YAxis tickFormatter={(value) => formatCurrency(value, currency).replace(currency, "")} tick={{ fill: chartAxisColor }}/>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{ backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff', border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`}}
                  labelStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                  itemStyle={{ color: currentTheme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                />
                <Legend wrapperStyle={{ color: chartAxisColor }}/>
                <Line type="monotone" dataKey="Saldo" stroke={CHART_COLORS.balance} strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
