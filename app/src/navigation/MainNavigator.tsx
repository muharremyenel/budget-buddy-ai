import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { BudgetScreen } from '../screens/budget/BudgetScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { TestScreen } from '../screens/debug/TestScreen';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  const { user } = useAuth();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <IconButton icon="home" size={24} iconColor={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <IconButton icon="swap-horizontal" size={24} iconColor={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Budget" 
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <IconButton icon="chart-pie" size={24} iconColor={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <IconButton icon="account" size={24} iconColor={color} />
          ),
        }}
      />
      {isDevelopment && (
        <Tab.Screen 
          name="Test" 
          component={TestScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <IconButton icon="bug" size={24} iconColor={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;