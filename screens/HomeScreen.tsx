import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { readItems, deleteItem, Item } from '../services/itemService';
import { useTheme } from '../contexts/ThemeContext';
import { MainTabParamList, RootStackParamList } from '../App';
import CustomAlert from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  useEffect(() => {
    const unsubscribe = readItems((fetchedItems) => {
      setItems(fetchedItems);
    });
    return unsubscribe;
  }, []);

  const isExpiringSoon = (expiryDate: Date) => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiryDate <= sevenDaysFromNow;
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const handleDelete = (item: Item) => {
    setItemToDelete(item);
    setAlertVisible(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteItem(itemToDelete.id!);
        setAlertVisible(false);
        setItemToDelete(null);
      } catch (error: any) {
        Alert.alert('Error', error.message);
        setAlertVisible(false);
        setItemToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setAlertVisible(false);
    setItemToDelete(null);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: isExpiringSoon(item.expiryDate) ? theme.highlightColor : theme.inputBackground },
        ]}
        onPress={() => navigation.getParent()?.navigate('AddItemScreen', { item })}
      >
        <Text style={[styles.itemText, { color: theme.textColor }]}>{item.name}</Text>
        <Text style={[styles.itemText, { color: theme.textColor }]}>Quantity: {item.quantity}</Text>
        <Text style={[styles.itemText, { color: theme.textColor }]}>Expiry: {item.expiryDate.toDateString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: '#ff4444' }]}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Ionicons name="home-outline" size={28} color={theme.textColor} />
        <Text style={[styles.title, { color: theme.textColor }]}>Household Stock Tracker</Text>
      </View>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="basket-outline" size={64} color={theme.textColor} opacity={0.5} />
          <Text style={[styles.emptyStateText, { color: theme.textColor }]}>No items yet</Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.textColor }]}>Add your first item to get started</Text>
        </View>
      ) : (
        <>
          {Object.keys(groupedItems).map((category) => (
            <View key={category}>
              <Text style={[styles.categoryTitle, { color: theme.textColor }]}>{category.toUpperCase()}</Text>
              <FlatList
                data={groupedItems[category]}
                renderItem={renderItem}
                keyExtractor={(item) => item.id!}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ))}
        </>
      )}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.buttonColor }]}
        onPress={() => navigation.getParent()?.navigate('AddItemScreen')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={alertVisible}
        title="Delete Item"
        message={itemToDelete ? `Are you sure you want to delete ${itemToDelete.name}?` : ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        cancelText="Cancel"
        confirmText="Delete"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
});

export default HomeScreen;
