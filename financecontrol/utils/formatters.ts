
import { DEFAULT_CURRENCY } from '../constants';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (amount: number, currency: string = DEFAULT_CURRENCY): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(amount);
};

export const formatDate = (dateString: string, dateFormat: string = 'dd/MM/yyyy'): string => {
  try {
    return format(parseISO(dateString), dateFormat, { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // return original string if parsing fails
  }
};

export const getMonthName = (month: number): string => { // 1-indexed month
  const date = new Date();
  date.setMonth(month - 1);
  return format(date, 'MMMM', { locale: ptBR });
};
    