import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, Avatar, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { MainTabParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

export const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || '');
  const [error, setError] = useState('');

  const handleEditProfile = async () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      // Implement profile update logic here
      setShowEditProfile(false);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Implement avatar upload logic here
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const stats = [
    { label: 'Total Expenses', value: '$2,450.00', icon: 'cash-minus' },
    { label: 'Total Income', value: '$4,200.00', icon: 'cash-plus' },
    { label: 'Active Budgets', value: '5', icon: 'chart-pie' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handlePickImage}>
            {avatarUrl ? (
              <Avatar.Image
                size={100}
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Icon
                size={100}
                icon="account"
                style={styles.avatar}
                color={theme.colors.onPrimary}
              />
            )}
            <View style={styles.editAvatarButton}>
              <IconButton
                icon="camera"
                size={20}
                onPress={handlePickImage}
                mode="contained"
                containerColor={theme.colors.primary}
                iconColor={theme.colors.onPrimary}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.name}>
              {displayName || 'Set Your Name'}
            </Text>
            <Text variant="bodyLarge" style={styles.email}>
              {user?.email}
            </Text>
            {bio ? (
              <Text variant="bodyMedium" style={styles.bio}>
                {bio}
              </Text>
            ) : null}
          </View>
          <Button
            mode="contained"
            onPress={() => setShowEditProfile(true)}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </View>
      </Surface>

      <Animated.View entering={FadeInDown.delay(200)}>
        {/* Stats Section */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Avatar.Icon
                  size={40}
                  icon={stat.icon}
                  style={styles.statIcon}
                  color={theme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.statValue}>
                  {stat.value}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* Quick Actions */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              icon="cog"
              onPress={() => navigation.navigate('AccountSettings')}
              style={styles.actionButton}
            >
              Account Settings
            </Button>
            <Button
              mode="outlined"
              icon="bell-outline"
              onPress={() => {/* Handle notifications */}}
              style={styles.actionButton}
            >
              Notifications
            </Button>
          </View>
        </Surface>
      </Animated.View>

      {/* Edit Profile Dialog */}
      <Portal>
        <Dialog visible={showEditProfile} onDismiss={() => setShowEditProfile(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.dialogInput}
            />
            <TextInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditProfile(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleEditProfile}
              loading={loading}
              disabled={loading}
            >
              Save Changes
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
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  headerContent: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: -theme.spacing.sm,
  },
  headerText: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  email: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
  },
  bio: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  editButton: {
    marginTop: theme.spacing.sm,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    backgroundColor: theme.colors.primaryContainer,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  actionsContainer: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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

export default ProfileScreen; 