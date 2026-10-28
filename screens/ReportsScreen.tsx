import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { readItems, Item } from '../services/itemService';
import { useTheme } from '../contexts/ThemeContext';
import { logout } from '../services/authService';

type RootStackParamList = {
  SplashScreen: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  ForgotPasswordScreen: undefined;
  HomeScreen: undefined;
  AddItemScreen: { item?: Item };
  ReportsScreen: undefined;
  ProfileScreen: undefined;
};

type ReportsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReportsScreen'>;

const ReportsScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  useEffect(() => {
    const unsubscribe = readItems((fetchedItems) => {
      setItems(fetchedItems);
    });
    return unsubscribe;
  }, []);

  const totalItems = items.length;
  const expiringSoonItems = items.filter((item) => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return item.expiryDate <= sevenDaysFromNow;
  });
  const expiringSoonCount = expiringSoonItems.length;
  const groceries = items.filter((item) => item.category === 'grocery');
  const groceriesCount = groceries.length;
  const cleaning = items.filter((item) => item.category === 'cleaning');
  const cleaningCount = cleaning.length;

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
      <Text style={[styles.title, { color: theme.textColor }]}>Reports</Text>
      <View style={styles.reportsContainer}>
        <View style={styles.reportItem}>
          <Text style={[styles.reportText, { color: theme.textColor }]}>Total Items: {totalItems}</Text>
        </View>
        <View style={styles.reportItem}>
          <Text style={[styles.reportText, { color: theme.textColor }]}>Items Expiring Soon: {expiringSoonCount}</Text>
          {expiringSoonItems.map((item) => (
            <Text key={item.id} style={[styles.subText, { color: theme.textColor }]}>
              - {item.name} ({item.category})
            </Text>
          ))}
        </View>
        <View style={styles.reportItem}>
          <Text style={[styles.reportText, { color: theme.textColor }]}>Groceries: {groceriesCount}</Text>
          {groceries.map((item) => (
            <Text key={item.id} style={[styles.subText, { color: theme.textColor }]}>
              - {item.name}
            </Text>
          ))}
        </View>
        <View style={styles.reportItem}>
          <Text style={[styles.reportText, { color: theme.textColor }]}>Cleaning: {cleaningCount}</Text>
          {cleaning.map((item) => (
            <Text key={item.id} style={[styles.subText, { color: theme.textColor }]}>
              - {item.name}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportsContainer: {
    flex: 1,
  },
  reportItem: {
    marginBottom: 10,
  },
  reportText: {
    fontSize: 18,
  },
  subText: {
    fontSize: 16,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ReportsScreen;
