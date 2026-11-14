
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  createItem,
  updateItem,
  Item,
  CATEGORIES,
  Category,
} from '../services/itemService';

import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddItemScreen'
>;

type ScreenRouteProp = RouteProp<
  RootStackParamList,
  'AddItemScreen'
>;

const AddItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { theme } = useTheme();

  const editingItem = route.params?.item;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Groceries & Staples');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [minimumStock, setMinimumStock] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setQuantity(String(editingItem.quantity));
      setUnit(editingItem.unit || 'pcs');
      setMinimumStock(String(editingItem.minimumStock ?? 1));

      setExpiryDate(
        editingItem.expiryDate
          ? [
              editingItem.expiryDate.getFullYear(),
              String(editingItem.expiryDate.getMonth() + 1).padStart(2, '0'),
              String(editingItem.expiryDate.getDate()).padStart(2, '0'),
            ].join('-')
          : ''
      );

      setNotes(editingItem.notes || '');
    }
  }, [editingItem]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing information', 'Please enter an item name.');
      return;
    }

    const qty = Number(quantity);
    const minStock = Number(minimumStock);

    if (quantity.trim() === '' || !Number.isFinite(qty) || qty < 0) {
      Alert.alert('Invalid quantity', 'Enter a quantity of zero or greater.');
      return;
    }

    if (
      minimumStock.trim() === '' ||
      !Number.isFinite(minStock) ||
      minStock < 0
    ) {
      Alert.alert('Invalid minimum stock', 'Enter zero or a positive number.');
      return;
    }

    let parsedExpiryDate: Date | null = null;

    if (expiryDate.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
        Alert.alert('Invalid date', 'Use YYYY-MM-DD format.');
        return;
      }

      const [year, month, day] = expiryDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        Alert.alert('Invalid date', 'Please enter a real calendar date.');
        return;
      }

      parsedExpiryDate = date;
    }

    const itemData: Omit<Item, 'id'> = {
      name: name.trim(),
      description: editingItem?.description || '',
      category,
      quantity: qty,
      unit: unit.trim() || 'pcs',
      minimumStock: minStock,
      expiryDate: parsedExpiryDate,
      notes: notes.trim(),
      imageUrl: editingItem?.imageUrl || null,
    };

    try {
      setSaving(true);

      if (editingItem?.id) {
        await updateItem(editingItem.id, itemData);
      } else {
        await createItem(itemData);
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save the item.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.inputBackground,
      color: theme.inputTextColor,
      borderColor: theme.highlightColor,
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.backgroundColor }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.textColor }]}>
        {editingItem ? 'Edit Item' : 'Add New Item'}
      </Text>

      <Text style={[styles.label, { color: theme.textColor }]}>
        Item name *
      </Text>

      <TextInput
        style={inputStyle}
        placeholder="Example: Milk"
        placeholderTextColor={theme.textColor}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: theme.textColor }]}>
        Category *
      </Text>

      <View style={styles.categoryContainer}>
        {CATEGORIES.map((itemCategory) => (
          <TouchableOpacity
            key={itemCategory}
            onPress={() => setCategory(itemCategory)}
            style={[
              styles.categoryButton,
              {
                backgroundColor:
                  category === itemCategory
                    ? theme.buttonColor
                    : theme.inputBackground,
                borderColor: theme.highlightColor,
              },
            ]}
          >
            <Text
              style={{
                color:
                  category === itemCategory
                    ? theme.buttonTextColor
                    : theme.textColor,
                fontWeight: category === itemCategory ? 'bold' : 'normal',
              }}
            >
              {itemCategory}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textColor }]}>
        Quantity *
      </Text>

      <TextInput
        style={inputStyle}
        placeholder="Example: 2 or 1.5"
        placeholderTextColor={theme.textColor}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
      />

      <Text style={[styles.label, { color: theme.textColor }]}>
        Unit
      </Text>

      <TextInput
        style={inputStyle}
        placeholder="pcs, kg, litre, packet..."
        placeholderTextColor={theme.textColor}
        value={unit}
        onChangeText={setUnit}
      />

      <Text style={[styles.label, { color: theme.textColor }]}>
        Minimum stock
      </Text>

      <TextInput
        style={inputStyle}
        placeholder="Example: 1"
        placeholderTextColor={theme.textColor}
        value={minimumStock}
        onChangeText={setMinimumStock}
        keyboardType="decimal-pad"
      />

      <Text style={[styles.label, { color: theme.textColor }]}>
        Expiry date (optional)
      </Text>

      <TextInput
        style={inputStyle}
        placeholder="YYYY-MM-DD (leave empty if not applicable)"
        placeholderTextColor={theme.textColor}
        value={expiryDate}
        onChangeText={setExpiryDate}
      />

      <Text style={[styles.label, { color: theme.textColor }]}>
        Notes (Optional)
      </Text>

      <TextInput
        style={[inputStyle, styles.notesInput]}
        placeholder="Additional information (optional)"
        placeholderTextColor={theme.textColor}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.buttonColor },
          saving && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>
          {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Save Item'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.highlightColor }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.cancelText, { color: theme.textColor }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    fontSize: 15,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  categoryButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginBottom: 4,
  },

  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  button: {
    padding: 16,
    borderRadius: 14,
    marginTop: 22,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddItemScreen;
