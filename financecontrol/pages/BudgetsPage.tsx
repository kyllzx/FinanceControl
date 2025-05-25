
import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Budget, ExpenseCategory, TransactionType } from '../types';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { PlusCircleIcon, EditIcon, TrashIcon, AlertTriangleIcon } from '../components/icons';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { MONTHS_PT, ALL_CATEGORIES_MAP, EXPENSE_CATEGORIES_OPTIONS } from '../constants'; // Added EXPENSE_CATEGORIES_OPTIONS

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const yearOptions = Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }));
const monthOptions = MONTHS_PT.map((name, i) => ({ value: (i + 1).toString(), label: name }));

const BudgetFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    budgetToEdit?: Budget | null;
    selectedMonth: number;
    selectedYear: number;
}> = ({ isOpen, onClose, budgetToEdit, selectedMonth, selectedYear }) => {
    const { addBudget, updateBudget, budgets } = useData();
    const { user } = useAuth();
    const [category, setCategory] = useState<ExpenseCategory | ''>(budgetToEdit?.category || '');
    const [limit, setLimit] = useState<number>(budgetToEdit?.monthlyLimit || 0);
    const [alerts, setAlerts] = useState<boolean>(budgetToEdit?.alertsEnabled !== undefined ? budgetToEdit.alertsEnabled : true);

    useEffect(() => {
        if (budgetToEdit) {
            setCategory(budgetToEdit.category);
            setLimit(budgetToEdit.monthlyLimit);
            setAlerts(budgetToEdit.alertsEnabled);
        } else {
            const existingCategoriesForMonth = budgets
                .filter(b => b.month === selectedMonth && b.year === selectedYear)
                .map(b => b.category);
            const availableCategory = EXPENSE_CATEGORIES_OPTIONS.find(opt => !existingCategoriesForMonth.includes(opt.value as ExpenseCategory));
            
            setCategory(availableCategory ? availableCategory.value as ExpenseCategory : '');
            setLimit(0);
            setAlerts(true);
        }
    }, [budgetToEdit, isOpen, selectedMonth, selectedYear, budgets]);

    const handleSubmit = () => {
        if (!category || limit <= 0 || !user) {
            alert("Por favor, preencha a categoria e um limite válido.");
            return;
        }
        const budgetData = {
            category,
            monthlyLimit: limit,
            month: selectedMonth,
            year: selectedYear,
            alertsEnabled: alerts,
        };
        if (budgetToEdit) {
            updateBudget({ ...budgetData, id: budgetToEdit.id, userEmail: user.email });
        } else {
            const existingBudget = budgets.find(b => b.category === category && b.month === selectedMonth && b.year === selectedYear);
            if (existingBudget) {
                alert(`Já existe um orçamento para ${ALL_CATEGORIES_MAP[category]} em ${getMonthName(selectedMonth)}/${selectedYear}. Edite o existente.`);
                return;
            }
            addBudget(budgetData);
        }
        onClose();
    };
    
    const expenseCategoryOptions = EXPENSE_CATEGORIES_OPTIONS.map(opt => ({ value: opt.value as ExpenseCategory, label: opt.label }));


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={budgetToEdit ? "Editar Orçamento" : "Novo Orçamento"}>
            <div className="space-y-4">
                <Select 
                    label="Categoria" 
                    options={expenseCategoryOptions} 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)} 
                    disabled={!!budgetToEdit}
                />
                <Input 
                    label={`Limite Mensal (${user?.preferences?.currency || 'BRL'})`}
                    type="number" 
                    value={limit} 
                    onChange={(e) => setLimit(parseFloat(e.target.value))} 
                    step="0.01"
                />
                <label className="flex items-center space-x-2 mt-2">
                    <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} className="form-checkbox h-5 w-5 text-indigo-600 dark:text-indigo-500 border-slate-300 dark:border-slate-600 rounded"/>
                    <span className="text-slate-700 dark:text-slate-300">Ativar Alertas</span>
                </label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleSubmit}>{budgetToEdit ? "Salvar Alterações" : "Adicionar Orçamento"}</Button>
            </div>
        </Modal>
    );
};

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { getBudgetsByMonthYear, getTransactionsByMonthYear, deleteBudget, isLoadingData } = useData();
  
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const monthlyBudgets = useMemo(() => {
    return getBudgetsByMonthYear(selectedMonth, selectedYear).sort((a,b) => ALL_CATEGORIES_MAP[a.category].localeCompare(ALL_CATEGORIES_MAP[b.category]));
  }, [getBudgetsByMonthYear, selectedMonth, selectedYear]);

  const monthlyTransactions = useMemo(() => {
    return getTransactionsByMonthYear(selectedMonth, selectedYear);
  }, [getTransactionsByMonthYear, selectedMonth, selectedYear]);

  const handleOpenModal = (budget?: Budget) => {
    setBudgetToEdit(budget || null);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    if(window.confirm("Tem certeza que deseja excluir este orçamento?")) {
      deleteBudget(budgetId);
    }
  };

  if (!user || isLoadingData) {
    return <Layout pageTitle="Orçamentos"><div className="flex justify-center items-center h-full"><p className="text-slate-700 dark:text-slate-300">Carregando orçamentos...</p></div></Layout>;
  }
  
  const currency = user.preferences?.currency || 'BRL';

  return (
    <Layout pageTitle={`Orçamentos - ${getMonthName(selectedMonth)}/${selectedYear}`}>
      <div className="space-y-6">
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gerenciar Orçamentos</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <Select options={monthOptions} value={selectedMonth.toString()} onChange={e => setSelectedMonth(parseInt(e.target.value))} containerClassName="w-36"/>
                    <Select options={yearOptions} value={selectedYear.toString()} onChange={e => setSelectedYear(parseInt(e.target.value))} containerClassName="w-28"/>
                    <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<PlusCircleIcon />}>
                        Novo Orçamento
                    </Button>
                </div>
            </div>
        </Card>

        {monthlyBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyBudgets.map(budget => {
              const spent = monthlyTransactions
                .filter(t => t.type === TransactionType.EXPENSE && t.category === budget.category)
                .reduce((sum, t) => sum + t.amount, 0);
              const progress = budget.monthlyLimit > 0 ? Math.min((spent / budget.monthlyLimit) * 100, 100) : 0;
              const overspent = budget.monthlyLimit > 0 && spent > budget.monthlyLimit;
              const remaining = budget.monthlyLimit - spent;

              return (
                <Card key={budget.id} title={ALL_CATEGORIES_MAP[budget.category]} actions={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(budget)} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><EditIcon className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBudget(budget.id)} className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"><TrashIcon className="h-4 w-4"/></Button>
                    </>
                }>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Gasto: {formatCurrency(spent, currency)}</span>
                      <span>Limite: {formatCurrency(budget.monthlyLimit, currency)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${overspent ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${overspent ? 100 : progress}%` }}
                      ></div>
                    </div>
                    <div className={`text-sm font-medium ${remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                      {remaining >= 0 ? `${formatCurrency(remaining, currency)} restantes` : `${formatCurrency(Math.abs(remaining), currency)} excedidos`}
                    </div>
                    {overspent && budget.alertsEnabled && (
                      <div className="flex items-center text-xs text-red-500 dark:text-red-400 mt-1">
                        <AlertTriangleIcon className="h-4 w-4 mr-1"/> Limite excedido!
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">Nenhum orçamento definido para {getMonthName(selectedMonth)} de {selectedYear}.</p>
            <Button variant="outline" onClick={() => handleOpenModal()} className="mt-4" leftIcon={<PlusCircleIcon />}>
                Criar Primeiro Orçamento
            </Button>
          </Card>
        )}
      </div>
      <BudgetFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        budgetToEdit={budgetToEdit}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </Layout>
  );
};
