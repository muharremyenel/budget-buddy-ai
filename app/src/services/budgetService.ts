import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface Budget {
  totalBudget: number;
  categories: {
    [key: string]: number;
  };
  month: string; // Format: 'YYYY-MM'
  userId: string;
}

export const setBudget = async (budget: Omit<Budget, 'userId'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const budgetRef = doc(db, 'budgets', `${user.uid}_${budget.month}`);
  await setDoc(budgetRef, {
    ...budget,
    userId: user.uid,
  });
};

export const getCurrentBudget = async (): Promise<Budget | null> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const budgetRef = doc(db, 'budgets', `${user.uid}_${currentMonth}`);
  const budgetDoc = await getDoc(budgetRef);

  return budgetDoc.exists() ? (budgetDoc.data() as Budget) : null;
};

export const updateBudget = async (month: string, updates: Partial<Budget>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const budgetRef = doc(db, 'budgets', `${user.uid}_${month}`);
  await updateDoc(budgetRef, updates);
}; 