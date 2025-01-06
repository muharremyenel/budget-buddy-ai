import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List, Divider } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.email?.[0].toUpperCase() || 'U'} 
        />
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Profile Options */}
      <List.Section>
        <List.Item
          title="Account Settings"
          left={props => <List.Icon {...props} icon="account-cog" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Privacy"
          left={props => <List.Icon {...props} icon="shield-account" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Logout"
          left={props => <List.Icon {...props} icon="logout" color="red" />}
          onPress={handleLogout}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  email: {
    marginTop: 10,
    fontSize: 16,
  }
});

export default ProfileScreen; 