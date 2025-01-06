export type AlertType = 
  | 'over_budget' 
  | 'approaching_limit' 
  | 'recurring_due' 
  | 'unusual_spending' 
  | 'goal_milestone' 
  | 'budget_suggestion';

export type AlertPriority = 'low' | 'medium' | 'high';

export type AlertActionType = 'review' | 'adjust_budget' | 'acknowledge';

export interface AlertDetails {
  category?: string;
  amount?: number;
  threshold?: number;
  priority: AlertPriority;
  actionRequired: boolean;
  actionType: AlertActionType;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  message: string;
  details: AlertDetails;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AlertPreferences {
  overBudgetThreshold: number; // Percentage of budget
  unusualSpendingThreshold: number; // Percentage increase
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  mutedCategories: string[];
  mutedTypes: AlertType[];
  quietHoursStart?: string; // 24h format HH:mm
  quietHoursEnd?: string; // 24h format HH:mm
  timezone?: string;
}

export interface BudgetAlert {
  id: string;
  userId: string;
  type: AlertType;
  message: string;
  priority: AlertPriority;
  category?: string;
  amount?: number;
  threshold?: number;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionRequired?: boolean;
  actionType?: AlertActionType;
} 