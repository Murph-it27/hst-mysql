import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { readItems, Item, CATEGORIES } from '../services/itemService';
import { useTheme } from '../contexts/ThemeContext';
import type { MainTabParamList, RootStackParamList } from '../App';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const categoryMeta: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  background: string;
  image: any;
}> = {
  'Fruits & Vegetables': { icon: 'leaf-outline', tint: '#166534', background: '#DCFCE7', image: require('../assets/categories/produce.jpg') },
  'Dairy & Eggs': { icon: 'nutrition-outline', tint: '#075985', background: '#E0F2FE', image: require('../assets/categories/dairy.jpg') },
  'Groceries & Staples': { icon: 'basket-outline', tint: '#92400E', background: '#FEF3C7', image: require('../assets/categories/pantry.jpg') },
  'Snacks & Beverages': { icon: 'cafe-outline', tint: '#9A3412', background: '#FFEDD5', image: require('../assets/categories/snacks.jpg') },
  'Cleaning Supplies': { icon: 'sparkles-outline', tint: '#6D28D9', background: '#EDE9FE', image: require('../assets/categories/cleaning.jpg') },
  'Personal Care': { icon: 'heart-outline', tint: '#9D174D', background: '#FCE7F3', image: require('../assets/categories/personal-care.jpg') },
  Laundry: { icon: 'water-outline', tint: '#0F766E', background: '#CCFBF1', image: require('../assets/categories/laundry.jpg') },
  'Health & First Aid': { icon: 'medkit-outline', tint: '#991B1B', background: '#FEE2E2', image: require('../assets/categories/health.jpg') },
  'Pet Supplies': { icon: 'paw-outline', tint: '#6D28D9', background: '#EDE9FE', image: require('../assets/categories/pets.jpg') },
};

const getDays = (date: Date | null) => {
  if (!date) return null;
  const expiry = new Date(date);
  const today = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
};

const HomeScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDarkMode } = useTheme();

  useEffect(() => readItems(setItems), []);

  const lowStockItems = useMemo(
    () => items.filter(item => Number(item.quantity) <= Number(item.minimumStock)),
    [items]
  );
  const expiryItems = useMemo(
    () => items.filter(item => {
      const days = getDays(item.expiryDate);
      return days !== null && days <= 7;
    }).sort((a, b) => (getDays(a.expiryDate) ?? 999) - (getDays(b.expiryDate) ?? 999)),
    [items]
  );
  const categoryCounts = useMemo(
    () => CATEGORIES.map(category => ({
      category,
      count: items.filter(item => item.category === category).length,
    })),
    [items]
  );

  const goInventory = () => navigation.navigate('Inventory');
  const openAdd = () => navigation.getParent()?.navigate('AddItemScreen');

  const StatCard = ({ icon, label, value, accent, tint }: {
    icon: keyof typeof Ionicons.glyphMap; label: string; value: number; accent: string; tint: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={21} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: theme.textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.mutedColor }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]} contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <View style={styles.topline}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.accentColor }]}>YOUR HOME, IN GOOD ORDER</Text>
            <Text style={[styles.title, { color: theme.textColor }]}>Good to see you.</Text>
            <Text style={[styles.subtitle, { color: theme.mutedColor }]}>A clear view of what you have, what needs attention, and what comes next.</Text>
          </View>
          <TouchableOpacity onPress={openAdd} style={[styles.addButton, { backgroundColor: theme.buttonColor }]}>
            <Ionicons name="add" size={19} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add an item</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={isDarkMode ? ['#064E3B', '#0F766E'] : ['#065F46', '#0F9F75']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>HOUSEHOLD OVERVIEW</Text>
            <Text style={styles.heroTitle}>Everything at home.{ '\n' }One calm overview.</Text>
            <Text style={styles.heroDescription}>Stay ahead of low supplies and expiry dates without the clutter.</Text>
            <TouchableOpacity onPress={goInventory} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Explore inventory</Text>
              <Ionicons name="arrow-forward" size={16} color="#065F46" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroArtwork}>
            <Image source={require('../assets/categories/produce.jpg')} style={styles.heroPhoto} resizeMode="cover" />
            <View style={styles.artSmall}><Ionicons name="basket" size={30} color="#065F46" /></View>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <StatCard icon="cube-outline" label="Items tracked" value={items.length} accent="#047857" tint="#D1FAE5" />
          <StatCard icon="alert-circle-outline" label="Need restocking" value={lowStockItems.length} accent="#92400E" tint="#FEF3C7" />
          <StatCard icon="time-outline" label="Expiry reminders" value={expiryItems.length} accent="#9A3412" tint="#FFEDD5" />
          <StatCard icon="checkmark-circle-outline" label="Healthy stock" value={Math.max(0, items.length - lowStockItems.length)} accent="#166534" tint="#DCFCE7" />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Browse by category</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.mutedColor }]}>Jump straight to the part of your home you need.</Text>
          </View>
          <TouchableOpacity onPress={goInventory} style={styles.textLink}>
            <Text style={{ color: theme.accentColor, fontWeight: '700' }}>View inventory</Text>
            <Ionicons name="arrow-forward" size={15} color={theme.accentColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {categoryCounts.map(({ category, count }) => {
            const meta = categoryMeta[category];
            return (
              <TouchableOpacity
                key={category}
                onPress={goInventory}
                activeOpacity={0.88}
                style={[styles.categoryCard, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}
              >
                <View style={styles.categoryTextWrap}>
                  <View style={[styles.categoryIcon, { backgroundColor: meta.background }]}>
                    <Ionicons name={meta.icon} size={17} color={meta.tint} />
                  </View>
                  <Text style={[styles.categoryName, { color: theme.textColor }]}>{category}</Text>
                  <Text style={[styles.categoryCount, { color: theme.mutedColor }]}>{count} {count === 1 ? 'item' : 'items'}</Text>
                </View>
                <Image source={meta.image} style={styles.categoryImage} resizeMode="cover" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.reminderColumns}>
          <View style={[styles.reminderPanel, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelTitleRow}>
                <View style={[styles.panelIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="cart-outline" size={18} color="#92400E" /></View>
                <Text style={[styles.panelTitle, { color: theme.textColor }]}>Restock reminders</Text>
              </View>
              <Text style={[styles.countPill, { backgroundColor: theme.warningBackground, color: theme.warningText }]}>{lowStockItems.length}</Text>
            </View>
            {lowStockItems.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.mutedColor }]}>Everything is above its minimum stock level.</Text>
            ) : lowStockItems.slice(0, 3).map(item => (
              <TouchableOpacity key={item.id} onPress={goInventory} style={[styles.reminderRow, { borderTopColor: theme.cardBorder }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reminderName, { color: theme.textColor }]}>{item.name}</Text>
                  <Text style={[styles.reminderMeta, { color: theme.mutedColor }]}>{item.quantity} {item.unit} remaining · minimum {item.minimumStock}</Text>
                </View>
                <Ionicons name="arrow-up-right" size={17} color={theme.accentColor} />
              </TouchableOpacity>
            ))}
            {lowStockItems.length > 3 && <TouchableOpacity onPress={goInventory}><Text style={[styles.moreLink, { color: theme.accentColor }]}>See all {lowStockItems.length} items</Text></TouchableOpacity>}
          </View>

          <View style={[styles.reminderPanel, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelTitleRow}>
                <View style={[styles.panelIcon, { backgroundColor: '#FFEDD5' }]}><Ionicons name="calendar-outline" size={18} color="#9A3412" /></View>
                <Text style={[styles.panelTitle, { color: theme.textColor }]}>Expiry reminders</Text>
              </View>
              <Text style={[styles.countPill, { backgroundColor: theme.dangerBackground, color: theme.dangerText }]}>{expiryItems.length}</Text>
            </View>
            {expiryItems.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.mutedColor }]}>No items are expiring in the next 7 days.</Text>
            ) : expiryItems.slice(0, 3).map(item => {
              const days = getDays(item.expiryDate);
              return (
                <TouchableOpacity key={item.id} onPress={goInventory} style={[styles.reminderRow, { borderTopColor: theme.cardBorder }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reminderName, { color: theme.textColor }]}>{item.name}</Text>
                    <Text style={[styles.reminderMeta, { color: theme.mutedColor }]}>{days !== null && days < 0 ? 'Expired' : days === 0 ? 'Expires today' : `Expires in ${days} days`}</Text>
                  </View>
                  <Ionicons name="arrow-up-right" size={17} color={theme.accentColor} />
                </TouchableOpacity>
              );
            })}
            {expiryItems.length > 3 && <TouchableOpacity onPress={goInventory}><Text style={[styles.moreLink, { color: theme.accentColor }]}>See all {expiryItems.length} items</Text></TouchableOpacity>}
          </View>
        </View>

        <View style={[styles.footerNote, { borderColor: theme.cardBorder }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.accentColor} />
          <Text style={[styles.footerNoteText, { color: theme.mutedColor }]}>Your household overview updates automatically as you add, edit or remove items.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 56, alignItems: 'center' },
  page: { width: '100%', maxWidth: 1380 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, gap: 20, flexWrap: 'wrap' },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 9 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.1 },
  subtitle: { fontSize: 14, marginTop: 8, maxWidth: 620, lineHeight: 21 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 11, paddingHorizontal: 17, paddingVertical: 12 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  hero: { minHeight: 235, borderRadius: 22, padding: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', marginBottom: 20 },
  heroCopy: { maxWidth: 570, zIndex: 1 },
  heroKicker: { color: '#A7F3D0', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', letterSpacing: -0.8, lineHeight: 38, marginTop: 12 },
  heroDescription: { color: '#D1FAE5', fontSize: 13, lineHeight: 20, marginTop: 9, maxWidth: 410 },
  heroButton: { backgroundColor: '#FFFFFF', borderRadius: 10, alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 11, marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroButtonText: { color: '#065F46', fontWeight: '800', fontSize: 12 },
  heroArtwork: { width: 220, height: 180, alignItems: 'center', justifyContent: 'center' },
  heroPhoto: { width: 190, height: 164, borderRadius: 24, borderWidth: 4, borderColor: '#FFFFFF55', transform: [{ rotate: '3deg' }] },
  artSmall: { position: 'absolute', right: 10, bottom: 3, width: 64, height: 64, borderRadius: 22, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '9deg' }] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 34 },
  statCard: { flex: 1, minWidth: 170, borderWidth: 1, borderRadius: 16, padding: 17, minHeight: 135 },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 27, fontWeight: '800', marginTop: 12 },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 12, marginTop: 5 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  categoryCard: { flexGrow: 1, flexBasis: 270, minHeight: 128, borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  categoryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  categoryTextWrap: { flex: 1, paddingLeft: 3 },
  categoryName: { fontSize: 13, fontWeight: '800', lineHeight: 18 },
  categoryCount: { fontSize: 11, marginTop: 5 },
  categoryImage: { width: 104, height: 104, borderRadius: 14 },
  reminderColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  reminderPanel: { flex: 1, minWidth: 300, borderWidth: 1, borderRadius: 17, padding: 18 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  panelTitle: { fontSize: 14, fontWeight: '800' },
  countPill: { overflow: 'hidden', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '800' },
  reminderRow: { borderTopWidth: 1, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderName: { fontSize: 12, fontWeight: '700' },
  reminderMeta: { fontSize: 11, marginTop: 4 },
  emptyText: { fontSize: 12, paddingVertical: 12, lineHeight: 19 },
  moreLink: { fontSize: 11, fontWeight: '800', paddingTop: 8 },
  footerNote: { borderTopWidth: 1, marginTop: 25, paddingTop: 18, flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerNoteText: { fontSize: 11, flex: 1 },
});

export default HomeScreen;
