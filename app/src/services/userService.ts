import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types/user';

export const createUserProfile = async (userData: Partial<UserProfile>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  try {
    await updateProfile(user, {
      displayName: userData.displayName,
    });

    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: userData.displayName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber || null,
      createdAt: new Date(),
      settings: {
        currency: 'USD',
        language: 'en',
        theme: 'light',
      }
    };

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, userProfile, { merge: true });

    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  // Update auth profile if name is changed
  if (updates.displayName) {
    await updateProfile(user, {
      displayName: updates.displayName,
    });
  }

  // Update Firestore profile
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, updates);
}; 