
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Select } from '../components/Select';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TransactionType, IncomeCategory, ExpenseCategory, RecurringType, Transaction, OptionType } from '../types';
import { INCOME_CATEGORIES_OPTIONS, EXPENSE_CATEGORIES_OPTIONS, DEFAULT_CURRENCY } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircleIcon, EditIcon, DollarSignIcon, CalendarIcon, ListChecksIcon, TrashIcon } from '../components/icons';
import { format, parseISO } from 'date-fns';

const initialFormDataOmit: Omit<Transaction, 'id' | 'userEmail' | 'month' | 'year' | 'amount'> = {
  type: TransactionType.EXPENSE,
  category: EXPENSE_CATEGORIES_OPTIONS[0].value as ExpenseCategory,
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  recurring: false,
  recurringType: undefined as RecurringType | undefined,
  tags: [] as string[],
  location: '',
  receiptUrl: '',
};

export const AddTransactionPage: React.FC = () => {
  const { user } = useAuth();
  const { addTransaction, updateTransaction, getTransactionsByMonthYear, deleteTransaction } = useData();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId?: string }>();

  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'userEmail' | 'month' | 'year'>>({
    ...initialFormDataOmit,
    amount: 0,
  });
  const [amountDisplay, setAmountDisplay] = useState<string>("0");
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (transactionId) {
      let transactionToEdit: Transaction | undefined = undefined;
      // Search in recent months - simplified loop
      const today = new Date();
      for(let i=0; i<12; i++){ 
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const monthTxs = getTransactionsByMonthYear(month, year);
        transactionToEdit = monthTxs.find(t => t.id === transactionId);
        if(transactionToEdit) break;
      }

      if (transactionToEdit) {
        setFormData({
          type: transactionToEdit.type,
          category: transactionToEdit.category,
          amount: transactionToEdit.amount,
          date: format(parseISO(transactionToEdit.date), 'yyyy-MM-dd'),
          description: transactionToEdit.description || '',
          recurring: transactionToEdit.recurring || false,
          recurringType: transactionToEdit.recurringType,
          tags: transactionToEdit.tags || [],
          location: transactionToEdit.location || '',
          receiptUrl: transactionToEdit.receiptUrl || '',
        });
        setAmountDisplay(transactionToEdit.amount.toString());
        setIsEditing(true);
        setCurrentStep(1); 
      } else {
        console.warn("Transaction not found for editing:", transactionId);
        navigate('/dashboard'); // Or show error
      }
    } else {
      setFormData({ ...initialFormDataOmit, amount: 0 });
      setAmountDisplay("0");
      setIsEditing(false);
      setCurrentStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'amount') {
      setAmountDisplay(value); // Update display string directly
      if (value === '') {
        setFormData(prev => ({ ...prev, amount: 0 }));
      } else {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          setFormData(prev => ({ ...prev, amount: num }));
        }
        // If num is NaN, formData.amount retains its previous valid value.
      }
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({
        ...prev,
        type,
        category: type === TransactionType.INCOME 
                    ? INCOME_CATEGORIES_OPTIONS[0].value as IncomeCategory 
                    : EXPENSE_CATEGORIES_OPTIONS[0].value as ExpenseCategory,
    }));
  };

  const categoryOptions: OptionType[] = formData.type === TransactionType.INCOME ? INCOME_CATEGORIES_OPTIONS : EXPENSE_CATEGORIES_OPTIONS;

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalAmount = parseFloat(amountDisplay);
    if (isNaN(finalAmount)) {
        alert("O valor da transação é inválido.");
        return;
    }
     if (!formData.category) { // Should not happen if initialized correctly
        alert("Por favor, selecione uma categoria.");
        return;
    }
    // Use finalAmount for validation and saving
    if (finalAmount <= 0 && !isEditing) { 
        alert("O valor da transação deve ser maior que zero.");
        return;
    }
    
    const transactionDataToSave = {
        ...formData,
        amount: finalAmount, // Ensure the final parsed amount is used
    };


    if (isEditing && transactionId) {
        const dateObj = parseISO(transactionDataToSave.date);
        updateTransaction({
            ...transactionDataToSave,
            id: transactionId,
            userEmail: user.email,
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear()
        });
        alert('Transação atualizada com sucesso!');
    } else {
        addTransaction(transactionDataToSave);
        alert('Transação adicionada com sucesso!');
    }
    navigate('/dashboard');
  };

  const handleDelete = () => {
    if (isEditing && transactionId && window.confirm("Tem certeza que deseja excluir esta transação?")) {
        deleteTransaction(transactionId);
        alert('Transação excluída com sucesso!');
        navigate('/dashboard');
    }
  };
  
  const currency = user?.preferences?.currency || DEFAULT_CURRENCY;
  const currentTheme = user?.preferences?.theme || 'light';


  const renderStep = () => {
    switch (currentStep) {
      case 1: // Type and Category
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Transação</h3>
              <div className="flex space-x-4">
                <Button variant={formData.type === TransactionType.INCOME ? 'primary' : 'outline'} onClick={() => handleTypeChange(TransactionType.INCOME)} className="flex-1">Receita</Button>
                <Button variant={formData.type === TransactionType.EXPENSE ? 'primary' : 'outline'} onClick={() => handleTypeChange(TransactionType.EXPENSE)} className="flex-1">Despesa</Button>
              </div>
            </div>
            <Select label="Categoria" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
            <div className="flex justify-end">
              <Button onClick={nextStep} variant="primary">Próximo</Button>
            </div>
          </div>
        );
      case 2: // Amount, Date, Description
        return (
          <div className="space-y-6">
            <Input 
                label={`Valor (${currency})`} 
                name="amount" 
                type="text" // Changed to text
                value={amountDisplay} 
                onChange={handleChange} 
                required 
                inputMode="decimal"
                placeholder="0.00"
            />
            <Input label="Data" name="date" type="date" value={formData.date} onChange={handleChange} required 
                   className={currentTheme === 'dark' ? 'dark-date-input' : ''}
            />
            <Textarea label="Descrição (Opcional)" name="description" value={formData.description} onChange={handleChange} rows={3} />
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="secondary">Anterior</Button>
              <Button onClick={nextStep} variant="primary">Próximo</Button>
            </div>
          </div>
        );
      case 3: // Optional details: Recurring, Tags, Location, Receipt
        return (
          <div className="space-y-6">
             <div className="flex items-center space-x-2">
              <input type="checkbox" id="recurring" name="recurring" checked={formData.recurring} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500"/>
              <label htmlFor="recurring" className="text-sm font-medium text-slate-700 dark:text-slate-300">Transação Recorrente?</label>
            </div>
            {formData.recurring && (
              <Select label="Tipo de Recorrência" name="recurringType" value={formData.recurringType || ''} onChange={handleChange} options={[
                { value: RecurringType.MONTHLY, label: 'Mensal' },
                { value: RecurringType.WEEKLY, label: 'Semanal' },
                { value: RecurringType.YEARLY, label: 'Anual' },
              ]} />
            )}
            <Input label="Tags (separadas por vírgula, opcional)" name="tags" type="text" value={formData.tags?.join(', ') || ''} onChange={e => setFormData(prev => ({...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)}))} />
            <Input label="Local (opcional)" name="location" type="text" value={formData.location || ''} onChange={handleChange} />
            <Input label="URL do Comprovante (opcional)" name="receiptUrl" type="url" value={formData.receiptUrl || ''} onChange={handleChange} />
            <div className="flex justify-between items-center pt-4">
              <Button onClick={prevStep} variant="secondary">Anterior</Button>
              <Button type="submit" variant="primary" leftIcon={isEditing ? <EditIcon/> : <PlusCircleIcon/>}>
                {isEditing ? 'Salvar Alterações' : 'Adicionar Transação'}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const stepIcons = [DollarSignIcon, CalendarIcon, ListChecksIcon];
  const stepTitles = ["Tipo & Categoria", "Valor & Detalhes", "Opcionais & Salvar"];

  return (
    <Layout pageTitle={isEditing ? 'Editar Transação' : 'Adicionar Nova Transação'}>
      <div className="max-w-2xl mx-auto">
        <style>
          {/* Style for date input calendar icon in dark mode */}
          {`
            input[type="date"]::-webkit-calendar-picker-indicator {
              filter: ${currentTheme === 'dark' ? 'invert(0.8)' : 'none'};
            }
            .dark-date-input { /* If more specific styling for date input in dark needed */
                color-scheme: dark;
            }
          `}
        </style>
        <Card>
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {stepTitles.map((title, index) => (
                        <div key={index} className={`flex flex-col items-center ${index + 1 <= currentStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                           {React.createElement(stepIcons[index], {className: "w-6 h-6 mb-1"})}
                           <span className="text-xs font-medium">{title}</span>
                        </div>
                    ))}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {renderStep()}
            </form>
            {isEditing && currentStep === 3 && (
                <div className="mt-6 border-t dark:border-slate-700 pt-6">
                    <Button variant="danger" onClick={handleDelete} className="w-full" leftIcon={<TrashIcon className="h-4 w-4"/>}>
                        Excluir Transação
                    </Button>
                </div>
            )}
        </Card>
      </div>
    </Layout>
  );
};
