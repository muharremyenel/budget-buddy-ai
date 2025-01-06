import { collection, addDoc, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc, Timestamp, limit, collectionGroup } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Transaction, TransactionCategory, TransactionFilters } from '../types/transaction';

// Cache for transaction patterns
let transactionPatterns: { [key: string]: string } = {};

export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const transaction = {
    ...transactionData,
    userId: user.uid,
    createdAt: new Date(),
  };

  // If it's a recurring transaction, schedule future occurrences
  if (transaction.isRecurring && transaction.recurrence) {
    await scheduleRecurringTransactions(transaction);
  }

  // Suggest category based on description if not provided
  if (!transaction.category) {
    transaction.suggestedCategory = await suggestCategory(transaction.description);
  }

  const userTransactionsRef = collection(db, 'users', user.uid, 'transactions');
  const docRef = await addDoc(userTransactionsRef, transaction);
  return { id: docRef.id, ...transaction };
};

export const getTransactions = async (filters?: Partial<TransactionFilters>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  let q = query(
    collectionGroup(db, 'transactions'),
    where('userId', '==', user.uid),
    orderBy('date', 'desc')
  );

  // Apply filters
  if (filters) {
    if (filters.startDate) {
      q = query(q, where('date', '>=', filters.startDate));
    }
    if (filters.endDate) {
      q = query(q, where('date', '<=', filters.endDate));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.isRecurring !== undefined) {
      q = query(q, where('isRecurring', '==', filters.isRecurring));
    }
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    recurrence: doc.data().recurrence ? {
      ...doc.data().recurrence,
      startDate: doc.data().recurrence.startDate.toDate(),
      endDate: doc.data().recurrence.endDate?.toDate(),
      lastProcessed: doc.data().recurrence.lastProcessed?.toDate(),
    } : undefined,
  })) as Transaction[];
};

const scheduleRecurringTransactions = async (transaction: Omit<Transaction, 'id'>) => {
  if (!transaction.recurrence) return;

  const { frequency, interval, startDate, endDate } = transaction.recurrence;
  let currentDate = new Date(startDate);
  const endDateTime = endDate ? new Date(endDate) : new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

  while (currentDate <= endDateTime) {
    const scheduledTransaction = {
      ...transaction,
      date: new Date(currentDate),
      isRecurring: true,
      recurrence: {
        ...transaction.recurrence,
        lastProcessed: new Date(),
      },
    };

    await addDoc(collection(db, 'transactions'), scheduledTransaction);

    // Calculate next occurrence
    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (interval * 7));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
    }
  }
};

export const suggestCategory = async (description: string): Promise<string | undefined> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // First, check the patterns cache
  const normalizedDescription = description.toLowerCase().trim();
  if (transactionPatterns[normalizedDescription]) {
    return transactionPatterns[normalizedDescription];
  }

  // Query recent transactions with similar descriptions
  const q = query(
    collectionGroup(db, 'transactions'),
    where('userId', '==', user.uid),
    where('description', '==', description),
    orderBy('createdAt', 'desc'),
    limit(5)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    // Use the most common category from similar transactions
    const categories = snapshot.docs.map(doc => doc.data().category);
    const mostCommonCategory = categories.reduce((acc, curr) => 
      categories.filter(cat => cat === acc).length >= categories.filter(cat => cat === curr).length ? acc : curr
    );
    
    // Cache the pattern
    transactionPatterns[normalizedDescription] = mostCommonCategory;
    return mostCommonCategory;
  }

  return undefined;
};

export const deleteTransaction = async (transactionId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
  await deleteDoc(transactionRef);
};

export const updateTransaction = async (
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
  await updateDoc(transactionRef, updates);
}; 