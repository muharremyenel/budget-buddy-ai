import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface Budget {
  id: string;
  userId: string;
  amount: number;
  categoryLimits: Record<string, number>;
  period: 'monthly' | 'weekly';
  date: Date;
}

export const getBudget = async (): Promise<Budget | null> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const budgetRef = doc(db, 'users', user.uid, 'budgets', currentMonth);
  const budgetDoc = await getDoc(budgetRef);

  if (!budgetDoc.exists()) return null;

  const data = budgetDoc.data();
  return {
    id: budgetDoc.id,
    userId: user.uid,
    amount: data.amount,
    categoryLimits: data.categoryLimits || {},
    period: data.period || 'monthly',
    date: data.date.toDate(),
  };
};

export const setBudget = async (budget: Omit<Budget, 'id' | 'userId' | 'date'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const budgetRef = doc(db, 'users', user.uid, 'budgets', currentMonth);
  
  await setDoc(budgetRef, {
    ...budget,
    userId: user.uid,
    date: new Date(),
  });
};

export const getBudgetHistory = async (months: number = 6): Promise<Budget[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const budgets: Budget[] = [];
  const currentDate = new Date();
  
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const month = date.toISOString().slice(0, 7);
    const budgetRef = doc(db, 'users', user.uid, 'budgets', month);
    const budgetDoc = await getDoc(budgetRef);
    
    if (budgetDoc.exists()) {
      const data = budgetDoc.data();
      budgets.push({
        id: budgetDoc.id,
        userId: user.uid,
        amount: data.amount,
        categoryLimits: data.categoryLimits || {},
        period: data.period || 'monthly',
        date: data.date.toDate(),
      });
    }
  }

  return budgets;
}; 