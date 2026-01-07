// Miami Beach Resort - Navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import TodayScreen from '../screens/TodayScreen';
import CalendarScreen from '../screens/CalendarScreen';
import BookingsScreen from '../screens/BookingsScreen';
import HousekeepingScreen from '../screens/HousekeepingScreen';
import AccountingScreen from '../screens/AccountingScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import SearchBookScreen from '../screens/SearchBookScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icons (emoji for simplicity - can replace with vector icons)
const tabIcons = {
  Today: '📋',
  Calendar: '📅',
  Bookings: '🛏️',
  Housekeeping: '🧹',
  Accounting: '💰',
  Search: '🔍',
};

// Main tabs component
const MainTabs = () => {
  const { user, canAccessTab } = useAuth();

  const tabs = [
    { name: 'Today', component: TodayScreen },
    { name: 'Calendar', component: CalendarScreen },
    { name: 'Bookings', component: BookingsScreen },
    { name: 'Housekeeping', component: HousekeepingScreen },
    { name: 'Accounting', component: AccountingScreen },
    { name: 'Search', component: SearchBookScreen },
  ];

  // Filter tabs based on user role
  const accessibleTabs = tabs.filter(tab => canAccessTab(tab.name.toLowerCase()));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {tabIcons[route.name] || '📄'}
          </Text>
        ),
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.darkSlate,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.darkSlate,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
              👤 {user?.name}
            </Text>
          </View>
        ),
      })}
    >
      {accessibleTabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
};

// Loading screen
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.darkSlate }}>
    <ActivityIndicator size="large" color={Colors.gold} />
    <Text style={{ color: Colors.white, marginTop: 20 }}>Loading...</Text>
  </View>
);

// Main app navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.darkSlate },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Main App Stack
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
              options={{ title: 'Booking Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
