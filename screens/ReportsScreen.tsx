
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  readItems,
  Item,
  CATEGORIES,
} from '../services/itemService';

import { useTheme } from '../contexts/ThemeContext';

const getExpiryStatus = (date: Date | null) => {
  if (!date) return 'none';

  const expiry = new Date(date);

  if (Number.isNaN(expiry.getTime())) return 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const days = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return 'expired';
  if (days <= 7) return 'soon';

  return 'safe';
};

const ReportsScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const { theme, toggleTheme, isDarkMode } = useTheme();

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
        return status === 'soon' || status === 'expired';
      }),
    [items]
  );

  const expiredCount = expiringItems.filter(
    (item) => getExpiryStatus(item.expiryDate) === 'expired'
  ).length;

  const categoryCounts = CATEGORIES.map((category) => ({
    category,
    count: items.filter((item) => item.category === category).length,
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.textColor }]}>
        Reports
      </Text>

      <Text style={[styles.subtitle, { color: theme.textColor }]}>
        Your household inventory summary
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="basket-outline" size={30} color={theme.accentColor} />

        <Text style={[styles.summaryNumber, { color: theme.textColor }]}>
          {items.length}
        </Text>

        <Text style={[styles.summaryLabel, { color: theme.textColor }]}>
          Total inventory items
        </Text>
      </View>

      <View style={styles.statsRow}>
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
          <Ionicons name="calendar-outline" size={24} color="#B85C50" />

          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {expiringItems.length}
          </Text>

          <Text style={[styles.statLabel, { color: theme.textColor }]}>
            Expiry alerts
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.inputBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Category breakdown
        </Text>

        {categoryCounts.map(({ category, count }) => {
          const percentage =
            items.length > 0 ? (count / items.length) * 100 : 0;

          return (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryHeading}>
                <Text style={[styles.categoryName, { color: theme.textColor }]}>
                  {category}
                </Text>

                <Text style={[styles.categoryCount, { color: theme.textColor }]}>
                  {count}
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.section, { backgroundColor: theme.inputBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Low-stock items
        </Text>

        {lowStockItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            All items are above their minimum stock level.
          </Text>
        ) : (
          lowStockItems.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <Ionicons name="alert-circle-outline" size={20} color="#C48B55" />

              <View style={styles.listDetails}>
                <Text style={[styles.listName, { color: theme.textColor }]}>
                  {item.name}
                </Text>

                <Text style={[styles.listInfo, { color: theme.textColor }]}>
                  {item.quantity} {item.unit} remaining
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.section, { backgroundColor: theme.inputBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
          Expiry reminders
        </Text>

        {expiringItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            No expired or soon-to-expire items.
          </Text>
        ) : (
          expiringItems.map((item) => {
            const status = getExpiryStatus(item.expiryDate);

            return (
              <View key={item.id} style={styles.listRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#B85C50"
                />

                <View style={styles.listDetails}>
                  <Text style={[styles.listName, { color: theme.textColor }]}>
                    {item.name}
                  </Text>

                  <Text style={styles.expiryStatus}>
                    {status === 'expired' ? 'Expired' : 'Expiring within 7 days'}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {expiredCount > 0 && (
          <Text style={styles.expiredSummary}>
            {expiredCount} item(s) have already expired.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: theme.buttonColor }]}
        onPress={toggleTheme}
      >
        <Ionicons
          name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
          size={20}
          color={theme.buttonTextColor}
        />

        <Text style={[styles.themeButtonText, { color: theme.buttonTextColor }]}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 6,
    marginBottom: 22,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryNumber: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    borderRadius: 17,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryRow: {
    marginBottom: 14,
  },
  categoryHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  categoryName: {
    fontSize: 13,
    flex: 1,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#DCDCCF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#687C46',
    borderRadius: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 11,
  },
  listDetails: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
  },
  listInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 3,
  },
  expiryStatus: {
    color: '#B85C50',
    fontSize: 12,
    marginTop: 3,
  },
  emptyText: {
    fontSize: 13,
    opacity: 0.7,
  },
  expiredSummary: {
    color: '#B85C50',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 13,
  },
  themeButton: {
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 5,
  },
  themeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ReportsScreen;
