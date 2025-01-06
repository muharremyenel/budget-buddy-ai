import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, setDoc, Timestamp, limit, getDoc, collectionGroup } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export type AlertType = 
  | 'over_budget' 
  | 'approaching_limit' 
  | 'recurring_due' 
  | 'unusual_spending' 
  | 'goal_milestone' 
  | 'budget_suggestion';

export type AlertPriority = 'low' | 'medium' | 'high';

export interface BudgetAlert {
  id: string;
  userId: string;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  category?: string;
  amount?: number;
  threshold?: number;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionRequired?: boolean;
  actionType?: 'review' | 'adjust_budget' | 'acknowledge';
}

export interface AlertPreferences {
  overBudgetThreshold: number; // Percentage (e.g., 90 for 90%)
  unusualSpendingThreshold: number; // Percentage above average
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  mutedCategories: string[];
  mutedTypes: AlertType[];
  quietHours?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  overBudgetThreshold: 90,
  unusualSpendingThreshold: 50,
  enableEmailNotifications: true,
  enablePushNotifications: true,
  mutedCategories: [],
  mutedTypes: [],
};

export const createBudgetAlert = async (
  type: AlertType,
  message: string,
  details: Partial<BudgetAlert>
) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Remove undefined values to prevent Firestore errors
  const cleanDetails = Object.entries(details).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  const alert: Omit<BudgetAlert, 'id'> = {
    userId: user.uid,
    type,
    priority: cleanDetails.priority || 'medium',
    message,
    category: cleanDetails.category,
    amount: cleanDetails.amount,
    threshold: cleanDetails.threshold,
    createdAt: new Date(),
    actionRequired: cleanDetails.actionRequired || false,
    actionType: cleanDetails.actionType || 'acknowledge',
    // Only include expiresAt if it's provided
    ...(cleanDetails.expiresAt && { expiresAt: cleanDetails.expiresAt })
  };

  const alertsRef = collection(db, 'users', user.uid, 'alerts');
  const docRef = await addDoc(alertsRef, alert);
  return { id: docRef.id, ...alert };
};

export const getUnreadAlerts = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const q = query(
    collectionGroup(db, 'alerts'),
    where('userId', '==', user.uid),
    where('readAt', '==', null),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    readAt: doc.data().readAt?.toDate(),
    expiresAt: doc.data().expiresAt?.toDate(),
  })) as BudgetAlert[];
};

export const markAlertAsRead = async (alertId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const alertRef = doc(db, 'users', user.uid, 'alerts', alertId);
  await updateDoc(alertRef, {
    readAt: new Date(),
  });
};

export const getAlertPreferences = async (): Promise<AlertPreferences> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const prefsRef = doc(db, `users/${user.uid}/preferences/alerts`);
  const prefsDoc = await getDoc(prefsRef);

  if (!prefsDoc.exists()) {
    // Create default preferences if they don't exist
    await setDoc(prefsRef, DEFAULT_ALERT_PREFERENCES);
    return DEFAULT_ALERT_PREFERENCES;
  }

  return prefsDoc.data() as AlertPreferences;
};

export const updateAlertPreferences = async (updates: Partial<AlertPreferences>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const prefsRef = doc(db, `users/${user.uid}/preferences/alerts`);
  const prefsDoc = await getDoc(prefsRef);

  if (!prefsDoc.exists()) {
    // Create with defaults first, then update
    await setDoc(prefsRef, DEFAULT_ALERT_PREFERENCES);
  }

  await updateDoc(prefsRef, updates);
}; 