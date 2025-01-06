export type TransactionType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TransactionCategory = {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  keywords?: string[]; // For smart categorization
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
  isRecurring?: boolean;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number; // e.g., every 2 weeks
    startDate: Date;
    endDate?: Date;
    lastProcessed?: Date;
  };
  suggestedCategory?: string; // For smart categorization
  notes?: string;
  tags?: string[];
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
  isRecurring?: boolean;
  tags?: string[];
}