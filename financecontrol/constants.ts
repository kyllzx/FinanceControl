
import { IncomeCategory, ExpenseCategory, OptionType } from './types';

export const APP_NAME = "FinanceControl";
export const DEFAULT_CURRENCY = "BRL";
export const LOCAL_STORAGE_KEY = "financeControlData";

export const INCOME_CATEGORIES_OPTIONS: OptionType[] = [
  { value: IncomeCategory.SALARY, label: "Salário" },
  { value: IncomeCategory.FREELANCE, label: "Freelance" },
  { value: IncomeCategory.INVESTMENTS, label: "Investimentos" },
  { value: IncomeCategory.GIFTS, label: "Presentes" },
  { value: IncomeCategory.OTHER, label: "Outra Receita" },
];

export const EXPENSE_CATEGORIES_OPTIONS: OptionType[] = [
  { value: ExpenseCategory.FOOD, label: "Alimentação" },
  { value: ExpenseCategory.TRANSPORT, label: "Transporte" },
  { value: ExpenseCategory.HOUSING, label: "Moradia" },
  { value: ExpenseCategory.BILLS, label: "Contas" },
  { value: ExpenseCategory.HEALTH, label: "Saúde" },
  { value: ExpenseCategory.EDUCATION, label: "Educação" },
  { value: ExpenseCategory.ENTERTAINMENT, label: "Lazer" },
  { value: ExpenseCategory.SHOPPING, label: "Compras" },
  { value: ExpenseCategory.SAVINGS_TRANSFER, label: "Transferência para Poupança" },
  { value: ExpenseCategory.OTHER, label: "Outra Despesa" },
];

// Fix: Construct ALL_CATEGORIES_MAP in a more type-safe way to satisfy Record<IncomeCategory | ExpenseCategory, string>
const incomeMap = Object.fromEntries(INCOME_CATEGORIES_OPTIONS.map(opt => [opt.value, opt.label])) as Record<IncomeCategory, string>;
const expenseMap = Object.fromEntries(EXPENSE_CATEGORIES_OPTIONS.map(opt => [opt.value, opt.label])) as Record<ExpenseCategory, string>;

export const ALL_CATEGORIES_MAP: Record<IncomeCategory | ExpenseCategory, string> = {
  ...incomeMap,
  ...expenseMap,
};


export const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const CHART_COLORS = {
  income: '#4CAF50', // Green
  expense: '#F44336', // Red
  balance: '#2196F3', // Blue
  categories: ['#FFC107', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#03A9F4', '#00BCD4', '#009688', '#8BC34A', '#CDDC39']
};