
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ShoppingItem,
  getShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from '../services/shoppingService';

import { useTheme } from '../contexts/ThemeContext';

export default function ShoppingScreen() {
  const { theme, isDarkMode } = useTheme();

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnit, setEditUnit] = useState('pcs');

  const colors = {
    background: isDarkMode ? '#1B1B1B' : '#FAF8F2',
    card: isDarkMode ? '#292929' : '#FFFFFF',
    text: isDarkMode ? '#E0E0E0' : '#30382B',
    muted: isDarkMode ? '#AAAAAA' : '#7C806F',
    olive: '#687C46',
    border: isDarkMode ? '#444444' : '#E9E5DA',
    soft: isDarkMode ? '#35412D' : '#E9DFC9',
    danger: '#B45C4D',
  };

  const loadItems = useCallback(async () => {
    try {
      const result = await getShoppingItems();
      setItems(result);
    } catch (error) {
      Alert.alert(
        'Unable to load shopping list',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async () => {
    const cleanName = name.trim();
    const amount = Number(quantity);

    if (!cleanName) {
      Alert.alert('Missing item name', 'Please enter an item name.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid quantity', 'Enter a quantity greater than zero.');
      return;
    }

    setSaving(true);

    try {
      await createShoppingItem({
        name: cleanName,
        quantity: amount,
        unit: unit.trim() || 'pcs',
      });

      setName('');
      setQuantity('1');
      setUnit('pcs');

      await loadItems();
    } catch (error) {
      Alert.alert(
        'Unable to add item',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(String(item.quantity));
    setEditUnit(item.unit);
  };

  const saveEdit = async (item: ShoppingItem) => {
    const cleanName = editName.trim();
    const amount = Number(editQuantity);

    if (!cleanName || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid details', 'Enter a valid name and quantity.');
      return;
    }

    setSaving(true);

    try {
      await updateShoppingItem(item.id, {
        name: cleanName,
        quantity: amount,
        unit: editUnit.trim() || 'pcs',
        isPurchased: item.isPurchased,
      });

      setEditingId(null);
      await loadItems();
    } catch (error) {
      Alert.alert(
        'Unable to update item',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePurchased = async (item: ShoppingItem) => {
    try {
      await updateShoppingItem(item.id, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        isPurchased: !item.isPurchased,
      });

      await loadItems();
    } catch (error) {
      Alert.alert(
        'Unable to update item',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const removeItem = (item: ShoppingItem) => {
    Alert.alert(
      'Delete item',
      `Do you want to remove ${item.name} from your shopping list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShoppingItem(item.id);
              await loadItems();
            } catch (error) {
              Alert.alert(
                'Unable to delete item',
                error instanceof Error ? error.message : 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const pendingCount = items.filter(item => !item.isPurchased).length;
  const purchasedCount = items.filter(item => item.isPurchased).length;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.background,
      color: colors.text,
      borderColor: colors.border,
    },
  ];

  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const editing = editingId === item.id;

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {editing ? (
          <View>
            <TextInput
              style={inputStyle}
              value={editName}
              onChangeText={setEditName}
              placeholder="Item name"
              placeholderTextColor={colors.muted}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[inputStyle, styles.halfInput]}
                value={editQuantity}
                onChangeText={setEditQuantity}
                keyboardType="decimal-pad"
                placeholder="Quantity"
                placeholderTextColor={colors.muted}
              />

              <TextInput
                style={[inputStyle, styles.halfInput]}
                value={editUnit}
                onChangeText={setEditUnit}
                placeholder="Unit"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.soft }]}
                onPress={() => setEditingId(null)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.olive }]}
                onPress={() => saveEdit(item)}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.itemRow}>
            <TouchableOpacity
              style={[
                styles.checkCircle,
                {
                  borderColor: colors.olive,
                  backgroundColor: item.isPurchased ? colors.olive : 'transparent',
                },
              ]}
              onPress={() => togglePurchased(item)}
            >
              {item.isPurchased && (
                <Text style={styles.checkMark}>✓</Text>
              )}
            </TouchableOpacity>

            <View style={styles.itemInfo}>
              <Text
                style={[
                  styles.itemName,
                  { color: colors.text },
                  item.isPurchased && styles.struckText,
                ]}
              >
                {item.name}
              </Text>

              <Text style={[styles.itemQuantity, { color: colors.muted }]}>
                {item.quantity} {item.unit}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.smallAction}
              onPress={() => startEditing(item)}
            >
              <Text style={[styles.editText, { color: colors.olive }]}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallAction}
              onPress={() => removeItem(item)}
            >
              <Text style={[styles.deleteText, { color: colors.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={[styles.heading, { color: colors.text }]}>
              Shopping List
            </Text>

            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Everything your household needs, in one place.
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.soft }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                  {pendingCount}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                  To buy
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                  {purchasedCount}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                  Purchased
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.addCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Add an item
              </Text>

              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Milk, rice, apples"
                placeholderTextColor={colors.muted}
              />

              <View style={styles.inputRow}>
                <TextInput
                  style={[inputStyle, styles.halfInput]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholder="Quantity"
                  placeholderTextColor={colors.muted}
                />

                <TextInput
                  style={[inputStyle, styles.halfInput]}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Unit (pcs, kg, L)"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.olive }]}
                onPress={addItem}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Please wait...' : '+ Add to shopping list'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your items
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.olive} style={styles.loader} />
          ) : (
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Your shopping list is empty. Add your first item above.
            </Text>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 25,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 13,
    marginTop: 3,
  },
  summaryDivider: {
    width: 1,
    height: 38,
  },
  addCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  primaryButton: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  itemCard: {
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkMark: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemQuantity: {
    fontSize: 12,
    marginTop: 3,
  },
  struckText: {
    textDecorationLine: 'line-through',
  },
  smallAction: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  editText: {
    fontWeight: '700',
    fontSize: 12,
  },
  deleteText: {
    fontWeight: '700',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  loader: {
    padding: 25,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 21,
  },
});
