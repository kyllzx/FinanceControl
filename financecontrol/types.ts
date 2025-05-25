
export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export enum IncomeCategory {
  SALARY = "salary",
  FREELANCE = "freelance",
  INVESTMENTS = "investments",
  GIFTS = "gifts",
  OTHER = "other_income",
}

export enum ExpenseCategory {
  FOOD = "food",
  TRANSPORT = "transport",
  HOUSING = "housing",
  BILLS = "bills",
  HEALTH = "health",
  EDUCATION = "education",
  ENTERTAINMENT = "entertainment",
  SHOPPING = "shopping",
  SAVINGS_TRANSFER = "savings_transfer",
  OTHER = "other_expense",
}

export enum RecurringType {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  YEARLY = "yearly",
}

export interface FinancialGoals {
  monthlyIncomeTarget: number;
  monthlyExpenseLimit: number;
  savingsTarget: number;
}

export type Theme = "light" | "dark";

export interface UserPreferences {
  currency: string;
  notificationsEnabled: boolean;
  theme: Theme;
  favoriteExpenseCategories: ExpenseCategory[];
}

export interface User {
  id: string; // email can be used as id
  name?: string;
  email: string;
  financialGoals?: FinancialGoals;
  preferences?: UserPreferences;
  profileCompleted: boolean;
  lastLogin?: string; // ISO date string
}

export interface Transaction {
  id: string;
  userEmail: string;
  type: TransactionType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  description?: string;
  date: string; // ISO date string
  month: number; // 1-12
  year: number;
  recurring?: boolean;
  recurringType?: RecurringType;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
}

export interface Budget {
  id: string;
  userEmail: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  month: number; // 1-12
  year: number;
  alertsEnabled: boolean;
}

// For chart data
export interface MonthlyInOutChartData {
  month: string;
  Receita: number;
  Despesa: number;
}

export interface CategoryChartData {
  name: string;
  value: number;
  fill: string;
}

export interface BalanceTrendChartData {
  name: string; // Month name or label
  Saldo: number;
}

export interface OptionType {
  value: string;
  label: string;
}