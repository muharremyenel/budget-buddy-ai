import { collection, addDoc, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Transaction } from '../types/transaction';

export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const transaction = {
    ...transactionData,
    userId: user.uid,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'transactions'), transaction);
  return { id: docRef.id, ...transaction };
};

export const getTransactions = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', user.uid),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Transaction[];
};

export const deleteTransaction = async (transactionId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  await deleteDoc(doc(db, 'transactions', transactionId));
}; 