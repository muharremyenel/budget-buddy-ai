export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: Date;
  settings?: {
    currency: string;
    language: string;
    theme: 'light' | 'dark';
  };
} 