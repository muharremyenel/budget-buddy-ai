import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/constants/theme';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { ProfileSetupScreen } from './src/screens/auth/ProfileSetupScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  const { user } = useAuth();
  
  console.log('Current user:', user?.email, 'DisplayName:', user?.displayName);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !user.displayName ? (
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen name="MainTabs" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}
