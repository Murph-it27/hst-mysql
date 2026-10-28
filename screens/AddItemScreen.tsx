import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createItem, updateItem, Item } from '../services/itemService';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../App';

type AddItemScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddItemScreen'>;
type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItemScreen'>;

const AddItemScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'grocery' | 'cleaning'>('grocery');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const navigation = useNavigation<AddItemScreenNavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();
  const { theme } = useTheme();
  const editingItem = route.params?.item;
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setQuantity(editingItem.quantity.toString());
      setExpiryDate(editingItem.expiryDate.toISOString().split('T')[0]);
      setNotes(editingItem.notes);
    }
  }, [editingItem]);

  const handleSave = async () => {
    if (!name || !category || !quantity || !expiryDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Quantity must be a positive number');
      return;
    }
    const expDate = new Date(expiryDate);
    if (isNaN(expDate.getTime())) {
      Alert.alert('Error', 'Please enter a valid date');
      return;
    }
    try {
      const itemData: Omit<Item, 'id'> = {
        name,
        description: notes,
        category,
        expiryDate: expDate,
        quantity: qty,
        notes,
      };
      if (editingItem?.id) {
        await updateItem(editingItem.id, itemData);
      } else {
        await createItem(itemData);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{editingItem ? 'Edit Item' : 'Add Item'}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Category (grocery or cleaning)"
        value={category}
        onChangeText={(text) => setCategory(text as 'grocery' | 'cleaning')}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Expiry Date (YYYY-MM-DD)"
        value={expiryDate}
        onChangeText={setExpiryDate}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={handleSave}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Cancel</Text>
      </TouchableOpacity>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
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

export default AddItemScreen;
