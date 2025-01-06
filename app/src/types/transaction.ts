export type TransactionType = 'income' | 'expense';

export type TransactionCategory = {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
};

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

export type TransactionSortOption = 'date' | 'amount' | 'category';
export type TransactionSortOrder = 'asc' | 'desc';

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}