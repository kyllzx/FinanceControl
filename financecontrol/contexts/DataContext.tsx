
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Transaction, Budget, User } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';
import { useAuth } from './AuthContext';
import { parseISO, getMonth, getYear } from 'date-fns';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userEmail' | 'month' | 'year'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  getTransactionsByMonthYear: (month: number, year: number) => Transaction[];
  addBudget: (budget: Omit<Budget, 'id' | 'userEmail'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  getBudgetsByMonthYear: (month: number, year: number) => Budget[];
  isLoadingData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface StoredData {
  transactions: Transaction[];
  budgets: Budget[];
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const getStorageKey = useCallback(() => {
    return user ? `${LOCAL_STORAGE_KEY}_${user.email}` : null;
  }, [user]);

  useEffect(() => {
    const key = getStorageKey();
    if (!key) {
      setTransactions([]);
      setBudgets([]);
      setIsLoadingData(false);
      return;
    };
    
    setIsLoadingData(true);
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData);
        setTransactions(parsedData.transactions || []);
        setBudgets(parsedData.budgets || []);
      } else {
        setTransactions([]);
        setBudgets([]);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setTransactions([]);
      setBudgets([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [getStorageKey]);

  useEffect(() => {
    const key = getStorageKey();
    if (!key || isLoadingData) return; // Don't save while loading or if no user

    try {
      const dataToStore: StoredData = { transactions, budgets };
      localStorage.setItem(key, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [transactions, budgets, getStorageKey, isLoadingData]);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'userEmail' | 'month' | 'year'>) => {
    if (!user) return;
    const dateObj = parseISO(transactionData.date);
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      userEmail: user.email,
      month: getMonth(dateObj) + 1, // 1-indexed
      year: getYear(dateObj),
    };
    setTransactions(prev => [...prev, newTransaction].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
  }, [user]);
  
  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    if (!user || updatedTransaction.userEmail !== user.email) return;
    const dateObj = parseISO(updatedTransaction.date);
    const transactionWithDateParts = {
        ...updatedTransaction,
        month: getMonth(dateObj) + 1,
        year: getYear(dateObj),
    };
    setTransactions(prev => 
        prev.map(t => t.id === transactionWithDateParts.id ? transactionWithDateParts : t)
            .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
    );
  }, [user]);

  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  }, []);

  const getTransactionsByMonthYear = useCallback((month: number, year: number) => {
    return transactions.filter(t => t.month === month && t.year === year);
  }, [transactions]);

  const addBudget = useCallback((budgetData: Omit<Budget, 'id' | 'userEmail'>) => {
    if (!user) return;
    const newBudget: Budget = {
      ...budgetData,
      id: crypto.randomUUID(),
      userEmail: user.email,
    };
    setBudgets(prev => [...prev, newBudget]);
  }, [user]);

  const updateBudget = useCallback((updatedBudget: Budget) => {
     if (!user || updatedBudget.userEmail !== user.email) return;
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  }, [user]);

  const deleteBudget = useCallback((budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  }, []);

  const getBudgetsByMonthYear = useCallback((month: number, year: number) => {
    return budgets.filter(b => b.month === month && b.year === year);
  }, [budgets]);
  

  return (
    <DataContext.Provider value={{ 
      transactions, 
      budgets, 
      addTransaction, 
      updateTransaction,
      deleteTransaction,
      getTransactionsByMonthYear,
      addBudget, 
      updateBudget,
      deleteBudget,
      getBudgetsByMonthYear,
      isLoadingData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
    