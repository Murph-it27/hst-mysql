
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import {
  readItems,
  deleteItem,
  Item,
  CATEGORIES,
} from '../services/itemService';

import { useTheme } from '../contexts/ThemeContext';
import { MainTabParamList, RootStackParamList } from '../App';

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const getExpiryDate = (date: Date | null): Date | null => {
  if (!date) return null;

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getExpiryStatus = (date: Date | null): 'expired' | 'soon' | 'safe' | 'none' => {
  const expiry = getExpiryDate(date);

  if (!expiry) return 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDay = new Date(expiry);
  expiryDay.setHours(0, 0, 0, 0);

  const days = Math.ceil(
    (expiryDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return 'expired';
  if (days <= 7) return 'soon';
  return 'safe';
};

const HomeScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const navigation = useNavigation<HomeNavigationProp>();
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = readItems(setItems);
    return unsubscribe;
  }, []);

  const lowStockItems = useMemo(
    () => items.filter((item) => item.quantity <= item.minimumStock),
    [items]
  );

  const expiringItems = useMemo(
    () =>
      items.filter((item) => {
        const status = getExpiryStatus(item.expiryDate);
        return status === 'expired' || status === 'soon';
      }),
    [items]
  );

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};

    CATEGORIES.forEach((category) => {
      groups[category] = items.filter(
        (item) => item.category === category
      );
    });

    return groups;
  }, [items]);

  const handleDelete = (item: Item) => {
    if (!item.id) return;

    Alert.alert(
      'Delete item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id!);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not delete item.');
            }
          },
        },
      ]
    );
  };

  const openEdit = (item: Item) => {
    navigation.getParent()?.navigate('AddItemScreen', { item });
  };

  const openAdd = () => {
    navigation.getParent()?.navigate('AddItemScreen');
  };

  const renderItem = (item: Item) => {
    const expiryStatus = getExpiryStatus(item.expiryDate);
    const isLowStock = item.quantity <= item.minimumStock;

    return (
      <View
        key={item.id}
        style={[
          styles.itemCard,
          { backgroundColor: theme.inputBackground },
        ]}
      >
        <TouchableOpacity
          style={styles.itemDetails}
          onPress={() => openEdit(item)}
        >
          <Text style={[styles.itemName, { color: theme.textColor }]}>
            {item.name}
          </Text>

          <Text style={[styles.itemInfo, { color: theme.textColor }]}>
            Quantity: {item.quantity} {item.unit}
          </Text>

          {isLowStock && (
            <Text style={styles.lowStockText}>
              Low stock
            </Text>
          )}

          {expiryStatus === 'expired' && (
            <Text style={styles.expiredText}>
              Expired
            </Text>
          )}

          {expiryStatus === 'soon' && (
            <Text style={styles.expiringText}>
              Expiring within 7 days
            </Text>
          )}

          {item.expiryDate && (
            <Text style={[styles.itemInfo, { color: theme.textColor }]}>
              Expiry: {getExpiryDate(item.expiryDate)?.toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEdit(item)}
          >
            <Ionicons name="create-outline" size={20} color="#687C46" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#B85C50" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textColor }]}>
            Your household
          </Text>
          <Text style={[styles.title, { color: theme.textColor }]}>
            Stock Overview
          </Text>
        </View>

        <Ionicons name="leaf-outline" size={32} color={theme.accentColor} />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.inputBackground }]}>
          <Ionicons name="basket-outline" size={24} color={theme.accentColor} />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {items.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            Total items
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.inputBackground }]}>
          <Ionicons name="alert-circle-outline" size={24} color="#C48B55" />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {lowStockItems.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            Low stock
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.inputBackground }]}>
          <Ionicons name="time-outline" size={24} color="#B85C50" />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {expiringItems.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            Expiry alerts
          </Text>
        </View>
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Low stock reminders
          </Text>

          {lowStockItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.alertCard}
              onPress={() => openEdit(item)}
            >
              <Ionicons name="alert-circle-outline" size={20} color="#C48B55" />
              <Text style={styles.alertText}>
                {item.name} — {item.quantity} {item.unit} left
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {expiringItems.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Expiry reminders
          </Text>

          {expiringItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.alertCard}
              onPress={() => openEdit(item)}
            >
              <Ionicons name="calendar-outline" size={20} color="#B85C50" />
              <Text style={styles.alertText}>
                {item.name} — {getExpiryStatus(item.expiryDate) === 'expired'
                  ? 'Expired'
                  : 'Expiring soon'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inventoryHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Your inventory
        </Text>

        <Text style={[styles.totalLabel, { color: theme.textColor }]}>
          {items.length} items
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="basket-outline" size={55} color={theme.accentColor} />
          <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
            Your pantry is empty
          </Text>
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            Add your first household item to get started.
          </Text>
        </View>
      ) : (
        CATEGORIES.map((category) => {
          const categoryItems = groupedItems[category];

          if (!categoryItems || categoryItems.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: theme.textColor }]}>
                {category}
              </Text>

              {categoryItems.map(renderItem)}
            </View>
          );
        })
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.buttonColor }]}
        onPress={openAdd}
      >
        <Ionicons name="add-circle-outline" size={23} color={theme.buttonTextColor} />
        <Text style={[styles.addButtonText, { color: theme.buttonTextColor }]}>
          Add Item
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  greeting: {
    fontSize: 15,
    opacity: 0.7,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertSection: {
    marginBottom: 20,
  },
  alertCard: {
    backgroundColor: '#F1E5D7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  alertText: {
    color: '#514333',
    fontSize: 14,
    flex: 1,
  },
  inventoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  categorySection: {
    marginBottom: 17,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  itemCard: {
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemInfo: {
    fontSize: 13,
    marginTop: 3,
    opacity: 0.8,
  },
  lowStockText: {
    color: '#A66C24',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  expiredText: {
    color: '#B85C50',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  expiringText: {
    color: '#C48B55',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  editButton: {
    padding: 7,
  },
  deleteButton: {
    padding: 7,
  },
  emptyState: {
    alignItems: 'center',
    padding: 35,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 13,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 7,
    opacity: 0.7,
  },
  addButton: {
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
