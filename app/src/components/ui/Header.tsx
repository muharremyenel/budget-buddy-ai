import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Badge, Surface } from 'react-native-paper';
import { theme } from '../../theme';

interface HeaderProps {
  title: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  showNotifications?: boolean;
}

export const Header = ({
  title,
  notificationCount = 0,
  onNotificationPress,
  showNotifications = false,
}: HeaderProps) => {
  return (
    <Surface style={styles.header} elevation={2}>
      <Text variant="headlineMedium" style={styles.title}>
        {title}
      </Text>
      <View style={styles.rightContainer}>
        <View style={styles.notificationContainer}>
          <IconButton
            icon="bell"
            size={24}
            onPress={onNotificationPress}
            style={styles.notificationIcon}
            iconColor={showNotifications ? theme.colors.primary : theme.colors.onSurface}
          />
          {notificationCount > 0 && (
            <Badge style={styles.badge} size={20}>
              {notificationCount}
            </Badge>
          )}
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationIcon: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
  },
}); 