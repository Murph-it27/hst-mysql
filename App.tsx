
import React from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import ReportsScreen from './screens/ReportsScreen';
import ProfileScreen from './screens/ProfileScreen';
import InventoryScreen from './screens/InventoryScreen';
import ShoppingScreen from './screens/ShoppingScreen';

import type { Item } from './services/itemService';

export type RootStackParamList = {
  SplashScreen: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  ForgotPasswordScreen: undefined;
  MainTabs: undefined;
  AddItemScreen: { item?: Item } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Shopping: undefined;
  Reports: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  // Desktop sidebar only on wide web screens.
  const isDesktop = Platform.OS === 'web' && width >= 900;

  const getIcon = (
    routeName: keyof MainTabParamList,
    focused: boolean
  ): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'Home':
        return focused ? 'home' : 'home-outline';

      case 'Inventory':
        return focused ? 'cube' : 'cube-outline';

      case 'Shopping':
        return focused ? 'cart' : 'cart-outline';

      case 'Reports':
        return focused ? 'bar-chart' : 'bar-chart-outline';

      case 'Profile':
        return focused ? 'person' : 'person-outline';

      default:
        return 'ellipse-outline';
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Desktop gets a left sidebar.
        // Mobile keeps bottom navigation.
        tabBarPosition: isDesktop ? 'left' : 'bottom',

        tabBarLabelPosition: isDesktop
          ? 'beside-icon'
          : 'below-icon',

        headerTitle: () => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: isDarkMode ? '#123326' : '#D1FAE5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="leaf"
                size={24}
                color={theme.accentColor}
              />
            </View>

            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '900',
                  letterSpacing: -0.6,
                  color: theme.textColor,
                }}
              >
                HomeStock
              </Text>

              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '700',
                  letterSpacing: 1.4,
                  color: theme.mutedColor,
                }}
              >
                HOUSEHOLD ORGANIZED
              </Text>
            </View>
          </View>
        ),

        headerRight: () => (
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.8}
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.inputBackground,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <Ionicons
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={theme.accentColor}
            />
          </TouchableOpacity>
        ),

        headerStyle: {
          backgroundColor: theme.inputBackground,
        },

        headerTintColor: theme.textColor,
        headerShadowVisible: false,
        headerTitleAlign: 'left',

        // Sidebar styling.
        tabBarStyle: isDesktop
          ? {
              width: 248,
              backgroundColor: theme.inputBackground,
              borderRightWidth: 1,
              borderRightColor: theme.cardBorder,
              borderTopWidth: 0,
              paddingTop: 28,
              paddingHorizontal: 12,
              paddingBottom: 20,
              elevation: 0,
            }
          : {
              backgroundColor: theme.inputBackground,
              borderTopColor: theme.cardBorder,
              borderTopWidth: 1,
              height: 68,
              paddingTop: 6,
              paddingBottom: 8,
              elevation: 0,
            },

        tabBarItemStyle: isDesktop
          ? {
              height: 50,
              marginVertical: 5,
              borderRadius: 12,
            }
          : {
              paddingVertical: 2,
            },

        tabBarActiveBackgroundColor: isDesktop
          ? isDarkMode
            ? '#123326'
            : '#D1FAE5'
          : 'transparent',

        tabBarInactiveBackgroundColor: 'transparent',

        tabBarActiveTintColor: theme.accentColor,
        tabBarInactiveTintColor: theme.mutedColor,

        tabBarLabelStyle: isDesktop
          ? {
              fontSize: 14,
              fontWeight: '700',
              textAlign: 'left',
            }
          : {
              fontSize: 10,
              fontWeight: '700',
            },

        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getIcon(route.name, focused)}
            size={isDesktop ? 21 : size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />

      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />

      <Tab.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{ title: 'Shopping' }}
      />

      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: '',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#0F172A',
            headerTitleStyle: {
              fontWeight: '800',
            },
          }}
        >
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
          />

          <Stack.Screen
            name="SignupScreen"
            component={SignupScreen}
          />

          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />

          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="AddItemScreen"
            component={AddItemScreen}
            options={{
              headerShown: true,
              title: 'Household Item',
            }}
          />
        </Stack.Navigator>

        <StatusBar style="auto" />
      </NavigationContainer>
    </ThemeProvider>
  );
}
