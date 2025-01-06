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