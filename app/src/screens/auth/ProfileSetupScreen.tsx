import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile } from '../../services/userService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { auth } from '../../config/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompleteProfile = async () => {
    if (!firstName || !lastName) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    try {
      await createUserProfile({
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        phoneNumber: phone || undefined,
      });
      
      // Force reload the user to get updated displayName
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      console.error('Profile setup error:', error);
      setError(error.message || 'Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Title style={styles.title}>Complete Your Profile</Title>
          
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
            returnKeyType="next"
          />

          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
            returnKeyType="next"
          />

          <TextInput
            label="Phone Number (Optional)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={handleCompleteProfile}
            loading={loading}
            disabled={loading || !firstName || !lastName}
            style={styles.button}
          >
            Complete Profile
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default ProfileSetupScreen; 