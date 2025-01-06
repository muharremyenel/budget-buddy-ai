import { TransactionCategory } from '../types/transaction';

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  // Income categories
  { id: 'salary', name: 'Salary', type: 'income', icon: 'cash' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: 'laptop' },
  { id: 'investments', name: 'Investments', type: 'income', icon: 'chart-line' },
  { id: 'other_income', name: 'Other', type: 'income', icon: 'plus-circle' },

  // Expense categories
  { id: 'food', name: 'Food & Dining', type: 'expense', icon: 'food' },
  { id: 'transportation', name: 'Transportation', type: 'expense', icon: 'car' },
  { id: 'utilities', name: 'Utilities', type: 'expense', icon: 'flash' },
  { id: 'rent', name: 'Rent', type: 'expense', icon: 'home' },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: 'shopping' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: 'movie' },
  { id: 'healthcare', name: 'Healthcare', type: 'expense', icon: 'medical-bag' },
  { id: 'other_expense', name: 'Other', type: 'expense', icon: 'dots-horizontal' },
];

export const getCategoriesByType = (type: 'income' | 'expense') => 
  TRANSACTION_CATEGORIES.filter(category => category.type === type); 