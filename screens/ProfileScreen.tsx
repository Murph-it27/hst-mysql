import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout, onAuthChange, User } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../App';

type MainTabParamList = {
  Home: undefined;
  Reports: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>Profile</Text>
      {user && user.username && (
        <Text style={[styles.userInfo, { color: theme.textColor }]}>
          User ID: {user.username}
        </Text>
      )}
      {user && (
        <Text style={[styles.userInfo, { color: theme.textColor }]}>
          Email: {user.email}
        </Text>
      )}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={toggleTheme}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 10,
  },
});

export default ProfileScreen;
