import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, List, Switch, Button, Portal, Dialog, TextInput, Divider } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const AccountSettingsScreen = () => {
  const { user, signOut, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    );
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      await resetPassword(user.email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      // Implement password change logic here
      setShowChangePassword(false);
      Alert.alert('Success', 'Password has been changed successfully.');
    } catch (error) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Account Settings</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Manage your account preferences and security
        </Text>
      </Surface>

      <Animated.View entering={FadeInDown.delay(200)}>
        {/* Account Information */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Account Information</Text>
          <List.Item
            title="Email"
            description={user?.email || 'No email set'}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Account Created"
            description={user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
        </Surface>

        {/* Notifications */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Notifications</Text>
          <List.Item
            title="Push Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                color={theme.colors.primary}
              />
            )}
          />
          <List.Item
            title="Email Notifications"
            left={props => <List.Icon {...props} icon="email-outline" />}
            right={() => (
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                color={theme.colors.primary}
              />
            )}
          />
        </Surface>

        {/* Security */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Security</Text>
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowChangePassword(true)}
          />
          <List.Item
            title="Reset Password"
            description="Send reset instructions to your email"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            onPress={handleResetPassword}
          />
        </Surface>

        {/* Account Actions */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Account Actions</Text>
          <Button
            mode="outlined"
            icon="logout"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textColor={theme.colors.error}
          >
            Sign Out
          </Button>
        </Surface>
      </Animated.View>

      {/* Change Password Dialog */}
      <Portal>
        <Dialog visible={showChangePassword} onDismiss={() => setShowChangePassword(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              right={
                <TextInput.Icon
                  icon={showCurrentPassword ? "eye-off" : "eye"}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
              style={styles.dialogInput}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? "eye-off" : "eye"}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
              style={styles.dialogInput}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showNewPassword}
              style={styles.dialogInput}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowChangePassword(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
            >
              Change Password
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  signOutButton: {
    margin: theme.spacing.md,
    borderColor: theme.colors.error,
  },
  dialogInput: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default AccountSettingsScreen; 