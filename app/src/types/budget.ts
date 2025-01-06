export interface Budget {
  id: string;
  userId: string;
  amount: number;
  categoryLimits: Record<string, number>;
  period: 'monthly' | 'weekly';
  date: Date;
} 