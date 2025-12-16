import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { authStorage } from './utils/storage';
import { ThemeProvider } from './contexts/ThemeContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import KYCScreen from './screens/KYCScreen';
import DashboardScreen from './screens/DashboardScreen';
import BuyCryptoScreen from './screens/BuyCryptoScreen';
import ExchangeCryptoScreen from './screens/ExchangeCryptoScreen';
import BuyGiftCardScreen from './screens/BuyGiftCardScreen';
import ExchangeGiftCardScreen from './screens/ExchangeGiftCardScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import AddMoneyScreen from './screens/AddMoneyScreen';
import ProfileScreen from './screens/ProfileScreen';
import MyProfileScreen from './screens/MyProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import HelpScreen from './screens/HelpScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const userData = await authStorage.getUserData();
    setIsLoggedIn(userData.isLoggedIn);
    setIsLoading(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
        >
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="KYC" component={KYCScreen} />

          {/* Main Screens */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="BuyCrypto" component={BuyCryptoScreen} />
          <Stack.Screen name="ExchangeCrypto" component={ExchangeCryptoScreen} />
          <Stack.Screen name="BuyGiftCard" component={BuyGiftCardScreen} />
          <Stack.Screen name="ExchangeGiftCard" component={ExchangeGiftCardScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="MyProfile" component={MyProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
