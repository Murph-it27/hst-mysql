
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import {
  readItems,
  deleteItem,
  Item,
  CATEGORIES,
} from '../services/itemService';
import {
  getShoppingItems,
  createShoppingItem,
} from '../services/shoppingService';
import type { ShoppingItem } from '../services/shoppingService';
import { useTheme } from '../contexts/ThemeContext';
import type { MainTabParamList, RootStackParamList } from '../App';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Inventory'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type ExpiryFilter = 'All' | 'Expired' | 'Expiring Soon' | 'No Expiry';

const getExpiryDays = (date: Date | null): number | null => {
  if (!date) return null;

  const expiry = new Date(date);
  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const InventoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low Stock'>('All');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('All');
  const [sortByExpiry, setSortByExpiry] = useState(false);
  const [addingIds, setAddingIds] = useState<string[]>([]);

  useEffect(() => {
    return readItems(setItems);
  }, []);

  const lowStockCount = items.filter(
    item => Number(item.quantity) <= Number(item.minimumStock)
  ).length;

  const filteredItems = useMemo(() => {
    const result = items.filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        item.category === selectedCategory;

      const lowStock =
        Number(item.quantity) <= Number(item.minimumStock);

      const matchesStock =
        stockFilter === 'All' || lowStock;

      const days = getExpiryDays(item.expiryDate);

      let matchesExpiry = true;

      if (expiryFilter === 'Expired') {
        matchesExpiry = days !== null && days < 0;
      } else if (expiryFilter === 'Expiring Soon') {
        matchesExpiry = days !== null && days >= 0 && days <= 7;
      } else if (expiryFilter === 'No Expiry') {
        matchesExpiry = days === null;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesExpiry
      );
    });

    if (sortByExpiry) {
      result.sort((a, b) => {
        const dateA = getExpiryDays(a.expiryDate);
        const dateB = getExpiryDays(b.expiryDate);

        if (dateA === null) return 1;
        if (dateB === null) return -1;

        return dateA - dateB;
      });
    }

    return result;
  }, [items, search, selectedCategory, stockFilter, expiryFilter, sortByExpiry]);

  const openAdd = () => {
    navigation.getParent()?.navigate('AddItemScreen');
  };

  const openEdit = (item: Item) => {
    navigation.getParent()?.navigate('AddItemScreen', { item });
  };

  const handleDelete = (item: Item) => {
    if (!item.id) return;

    Alert.alert(
      'Delete item',
      `Delete ${item.name} from your inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id!);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Unable to delete item.');
            }
          },
        },
      ]
    );
  };

  const addToShoppingList = async (item: Item) => {
    if (!item.id) return;

    const itemId = String(item.id);
    if (addingIds.includes(itemId)) return;

    setAddingIds(current => [...current, itemId]);

    try {
      const shoppingItems: ShoppingItem[] = await getShoppingItems();

      const alreadyExists = shoppingItems.some(
        shoppingItem =>
          shoppingItem.name.trim().toLowerCase() ===
          item.name.trim().toLowerCase()
      );

      if (alreadyExists) {
        Alert.alert(
          'Already in Shopping List',
          `${item.name} is already on your shopping list.`
        );
        return;
      }

      const restockQuantity = Math.max(
        Number(item.minimumStock) - Number(item.quantity),
        1
      );

      await createShoppingItem({
        name: item.name,
        quantity: restockQuantity,
        unit: item.unit || 'pcs',
      });

      Alert.alert(
        'Added successfully',
        `${item.name} has been added to your Shopping List.`
      );
    } catch (error: any) {
      Alert.alert('Unable to add item', error.message || 'Please try again.');
    } finally {
      setAddingIds(current => current.filter(id => id !== itemId));
    }
  };

  const filterButton = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[
        styles.filterButton,
        {
          backgroundColor: selected
            ? theme.buttonColor
            : theme.inputBackground,
          borderColor: theme.highlightColor,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? theme.buttonTextColor : theme.textColor,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.textColor }]}>
        My Inventory
      </Text>
      <Text style={[styles.subtitle, { color: theme.textColor }]}>
        Keep track of everything in your household.
      </Text>

      <View style={[styles.searchBox, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="search-outline" size={20} color={theme.accentColor} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search household items"
          placeholderTextColor={theme.textColor}
          style={[styles.searchInput, { color: theme.inputTextColor }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.textColor} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.filterHeading, { color: theme.textColor }]}>
        Stock status
      </Text>
      <View style={styles.filterRow}>
        {filterButton(`All (${items.length})`, stockFilter === 'All', () => setStockFilter('All'))}
        {filterButton(`Low Stock (${lowStockCount})`, stockFilter === 'Low Stock', () => setStockFilter('Low Stock'))}
      </View>

      <Text style={[styles.filterHeading, { color: theme.textColor }]}>
        Expiry status
      </Text>
      <View style={styles.filterRow}>
        {(['All', 'Expired', 'Expiring Soon', 'No Expiry'] as ExpiryFilter[]).map(filter =>
          filterButton(filter, expiryFilter === filter, () => setExpiryFilter(filter))
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.sortButton,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.highlightColor,
          },
        ]}
        onPress={() => setSortByExpiry(current => !current)}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={theme.accentColor}
        />
        <Text style={[styles.sortText, { color: theme.textColor }]}>
          {sortByExpiry ? 'Expiry: Earliest First ✓' : 'Sort by Earliest Expiry'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {['All', ...CATEGORIES].map(category =>
          filterButton(
            category,
            selectedCategory === category,
            () => setSelectedCategory(category)
          )
        )}
      </ScrollView>

      <View style={styles.resultHeader}>
        <Text style={[styles.resultTitle, { color: theme.textColor }]}>
          Items
        </Text>
        <Text style={[styles.resultCount, { color: theme.textColor }]}>
          {filteredItems.length} found
        </Text>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="basket-outline" size={55} color={theme.accentColor} />
          <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
            No matching items
          </Text>
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            Try changing your filters or add a new household item.
          </Text>
        </View>
      ) : (
        filteredItems.map(item => {
          const lowStock =
            Number(item.quantity) <= Number(item.minimumStock);

          const days = getExpiryDays(item.expiryDate);
          const itemId = String(item.id);
          const isAdding = addingIds.includes(itemId);

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
                <Text style={[styles.category, { color: theme.textColor }]}>
                  {item.category}
                </Text>
                <Text style={[styles.quantity, { color: theme.textColor }]}>
                  {item.quantity} {item.unit}
                </Text>

                {lowStock && <Text style={styles.lowStock}>Low stock</Text>}

                {days !== null && days < 0 && (
                  <Text style={styles.expired}>Expired</Text>
                )}
                {days !== null && days === 0 && (
                  <Text style={styles.expired}>Expires today</Text>
                )}
                {days !== null && days > 0 && days <= 7 && (
                  <Text style={styles.expiring}>
                    Expires in {days} day{days === 1 ? '' : 's'}
                  </Text>
                )}
                {item.expiryDate && days !== null && days > 7 && (
                  <Text style={[styles.expiry, { color: theme.textColor }]}>
                    Expires: {item.expiryDate.toLocaleDateString()}
                  </Text>
                )}
                {!item.expiryDate && (
                  <Text style={[styles.expiry, { color: theme.textColor }]}>
                    No expiry date
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionButton}>
                  <Ionicons name="create-outline" size={21} color="#687C46" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={21} color="#B85C50" />
                </TouchableOpacity>
              </View>

              {lowStock && (
                <TouchableOpacity
                  style={[
                    styles.shoppingButton,
                    { backgroundColor: theme.buttonColor },
                    isAdding && styles.disabledButton,
                  ]}
                  onPress={() => addToShoppingList(item)}
                  disabled={isAdding}
                >
                  <Ionicons name="cart-outline" size={18} color={theme.buttonTextColor} />
                  <Text style={[styles.shoppingButtonText, { color: theme.buttonTextColor }]}>
                    {isAdding ? 'Adding...' : 'Add to Shopping List'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.buttonColor }]}
        onPress={openAdd}
      >
        <Ionicons name="add" size={23} color={theme.buttonTextColor} />
        <Text style={[styles.addButtonText, { color: theme.buttonTextColor }]}>
          Add New Item
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', marginTop: 8 },
  subtitle: { fontSize: 14, opacity: 0.7, marginTop: 6, marginBottom: 20 },
  searchBox: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  filterHeading: { fontSize: 14, fontWeight: '700', marginTop: 17, marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 4,
    marginBottom: 5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  sortText: { fontSize: 13, fontWeight: '600' },
  filterScroll: { marginTop: 16, marginBottom: 18 },
  filterContent: { gap: 8, paddingRight: 10 },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultTitle: { fontSize: 19, fontWeight: 'bold' },
  resultCount: { fontSize: 13, opacity: 0.7 },
  itemCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  category: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  quantity: { fontSize: 13, marginTop: 5 },
  lowStock: { color: '#B47A31', fontWeight: 'bold', fontSize: 12, marginTop: 5 },
  expired: { color: '#B85C50', fontWeight: 'bold', fontSize: 12, marginTop: 5 },
  expiring: { color: '#C48B55', fontWeight: 'bold', fontSize: 12, marginTop: 5 },
  expiry: { fontSize: 12, opacity: 0.7, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { padding: 7 },
  shoppingButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 11,
    borderRadius: 11,
    marginTop: 13,
  },
  shoppingButtonText: { fontSize: 13, fontWeight: '700' },
  disabledButton: { opacity: 0.6 },
  emptyState: { alignItems: 'center', padding: 35 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  emptyText: { fontSize: 13, textAlign: 'center', opacity: 0.7, marginTop: 7 },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 15,
    borderRadius: 14,
    marginTop: 12,
  },
  addButtonText: { fontSize: 15, fontWeight: 'bold' },
});

export default InventoryScreen;
