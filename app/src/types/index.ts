// Basic types for our app
export interface User {
    id: string;
    email: string;
    displayName?: string;
  }
  
  export interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
    description: string;
  }
  
  export interface Budget {
    id: string;
    category: string;
    amount: number;
    spent: number;
    period: 'monthly' | 'weekly';
  }