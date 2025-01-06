import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, List, IconButton } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BudgetAlert } from '../../types/notification';
import { theme } from '../../theme';

interface NotificationPanelProps {
  notifications: BudgetAlert[];
  onDismiss: (id: string) => void;
}

export const NotificationPanel = ({ notifications, onDismiss }: NotificationPanelProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'over_budget':
        return 'alert-circle';
      case 'approaching_limit':
        return 'alert';
      default:
        return 'information';
    }
  };

  return (
    <Animated.View
      entering={FadeInDown}
      style={styles.container}
    >
      <Card>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Notifications</Text>
          {notifications.length > 0 ? (
            notifications.map((alert) => (
              <List.Item
                key={alert.id}
                title={alert.message}
                description={new Date(alert.createdAt).toLocaleDateString()}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={getAlertIcon(alert.type)}
                    color={
                      alert.type === 'over_budget'
                        ? theme.colors.error
                        : alert.type === 'approaching_limit'
                        ? theme.colors.warning
                        : theme.colors.primary
                    }
                  />
                )}
                right={props => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => onDismiss(alert.id)}
                  />
                )}
                style={styles.listItem}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No new notifications</Text>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    margin: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  listItem: {
    paddingLeft: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
    color: theme.colors.onSurfaceVariant,
  },
}); 