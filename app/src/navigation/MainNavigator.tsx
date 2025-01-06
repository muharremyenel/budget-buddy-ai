import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { BudgetScreen } from '../screens/budget/BudgetScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { IconButton } from 'react-native-paper';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
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
    </Tab.Navigator>
  );
};

export default MainNavigator;