import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { readItems, Item, CATEGORIES } from '../services/itemService';
import { useTheme } from '../contexts/ThemeContext';

const daysUntil = (date: Date | null) => {
  if (!date) return null;
  const expiry = new Date(date);
  const today = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
};

const ReportsScreen: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const { theme } = useTheme();
  useEffect(() => readItems(setItems), []);

  const summary = useMemo(() => {
    const out = items.filter(item => Number(item.quantity) <= 0).length;
    const low = items.filter(item => Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.minimumStock)).length;
    const expired = items.filter(item => { const d = daysUntil(item.expiryDate); return d !== null && d < 0; }).length;
    const soon = items.filter(item => { const d = daysUntil(item.expiryDate); return d !== null && d >= 0 && d <= 7; }).length;
    const healthy = Math.max(0, items.length - out - low);
    return { out, low, expired, soon, healthy };
  }, [items]);

  const categoryData = CATEGORIES.map(category => ({
    category,
    count: items.filter(item => item.category === category).length,
  })).sort((a, b) => b.count - a.count);
  const maxCategory = Math.max(1, ...categoryData.map(x => x.count));
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const Metric = ({ icon, label, value, color, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; color: string; tint: string }) => (
    <View style={[styles.metric, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
      <View style={[styles.metricIcon, { backgroundColor: tint }]}><Ionicons name={icon} size={20} color={color} /></View>
      <Text style={[styles.metricValue, { color: theme.textColor }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.mutedColor }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]} contentContainerStyle={styles.content}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.accentColor }]}>INSIGHTS & ANALYTICS</Text>
            <Text style={[styles.title, { color: theme.textColor }]}>Household reports</Text>
            <Text style={[styles.subtitle, { color: theme.mutedColor }]}>Understand your stock health at a glance. No duplicate inventory lists.</Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <Metric icon="cube-outline" label="Total products" value={items.length} color="#047857" tint="#D1FAE5" />
          <Metric icon="checkmark-circle-outline" label="Healthy stock" value={summary.healthy} color="#166534" tint="#DCFCE7" />
          <Metric icon="alert-triangle-outline" label="Low stock" value={summary.low} color="#92400E" tint="#FEF3C7" />
          <Metric icon="calendar-outline" label="Expiry attention" value={summary.expired + summary.soon} color="#9A3412" tint="#FFEDD5" />
        </View>

        <View style={styles.panels}>
          <View style={[styles.panel, styles.categoryPanel, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.panelHeader}>
              <View><Text style={[styles.panelTitle, { color: theme.textColor }]}>Category distribution</Text><Text style={[styles.panelSubtitle, { color: theme.mutedColor }]}>Where your household stock lives</Text></View>
              <Ionicons name="pie-chart-outline" size={21} color={theme.accentColor} />
            </View>
            {categoryData.map(({ category, count }) => (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryLine}>
                  <Text style={[styles.categoryName, { color: theme.textColor }]}>{category}</Text>
                  <Text style={[styles.categoryCount, { color: theme.mutedColor }]}>{count}</Text>
                </View>
                <View style={[styles.track, { backgroundColor: theme.backgroundColor }]}>
                  <View style={[styles.fill, { width: `${(count / maxCategory) * 100}%`, backgroundColor: theme.accentColor }]} />
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.panel, styles.healthPanel, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
            <View style={styles.panelHeader}>
              <View><Text style={[styles.panelTitle, { color: theme.textColor }]}>Stock health</Text><Text style={[styles.panelSubtitle, { color: theme.mutedColor }]}>Current stock status</Text></View>
              <Ionicons name="pulse-outline" size={21} color={theme.accentColor} />
            </View>
            <View style={styles.healthChart}>
              <View style={[styles.healthRing, { borderColor: theme.highlightColor }]}>
                <Text style={[styles.ringNumber, { color: theme.textColor }]}>{items.length ? Math.round((summary.healthy / items.length) * 100) : 0}%</Text>
                <Text style={[styles.ringLabel, { color: theme.mutedColor }]}>healthy</Text>
              </View>
            </View>
            {[
              { label: 'Healthy', value: summary.healthy, color: '#16A34A' },
              { label: 'Low stock', value: summary.low, color: '#D97706' },
              { label: 'Out of stock', value: summary.out, color: '#DC2626' },
            ].map(row => (
              <View key={row.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: row.color }]} />
                <Text style={[styles.legendLabel, { color: theme.mutedColor }]}>{row.label}</Text>
                <Text style={[styles.legendValue, { color: theme.textColor }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.expiryPanel, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.panelHeader}>
            <View><Text style={[styles.panelTitle, { color: theme.textColor }]}>Expiry overview</Text><Text style={[styles.panelSubtitle, { color: theme.mutedColor }]}>Items that may need attention</Text></View>
            <Ionicons name="hourglass-outline" size={21} color={theme.accentColor} />
          </View>
          <View style={styles.expiryStats}>
            <View style={[styles.expiryCard, { backgroundColor: theme.dangerBackground }]}>
              <Text style={[styles.expiryValue, { color: theme.dangerText }]}>{summary.expired}</Text>
              <Text style={[styles.expiryLabel, { color: theme.dangerText }]}>Expired</Text>
            </View>
            <View style={[styles.expiryCard, { backgroundColor: theme.warningBackground }]}>
              <Text style={[styles.expiryValue, { color: theme.warningText }]}>{summary.soon}</Text>
              <Text style={[styles.expiryLabel, { color: theme.warningText }]}>Within 7 days</Text>
            </View>
            <View style={[styles.expiryCard, { backgroundColor: theme.successBackground }]}>
              <Text style={[styles.expiryValue, { color: theme.successText }]}>{items.filter(item => item.expiryDate === null).length}</Text>
              <Text style={[styles.expiryLabel, { color: theme.successText }]}>No expiry date</Text>
            </View>
          </View>
        </View>

        <View style={[styles.footerInsight, { borderColor: theme.cardBorder }]}>
          <Ionicons name="analytics-outline" size={19} color={theme.accentColor} />
          <Text style={[styles.footerText, { color: theme.mutedColor }]}>You currently track {totalQuantity.toLocaleString()} total units across {items.length} products. These insights update automatically when your inventory changes.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 28, alignItems: 'center', paddingBottom: 55 },
  page: { width: '100%', maxWidth: 1380 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18, marginBottom: 25 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 7, lineHeight: 20 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginBottom: 18 },
  metric: { flex: 1, minWidth: 175, borderWidth: 1, borderRadius: 15, padding: 17 },
  metricIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 27, fontWeight: '800', marginTop: 13 },
  metricLabel: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  panels: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  panel: { borderWidth: 1, borderRadius: 17, padding: 20 },
  categoryPanel: { flex: 1.5, minWidth: 310 },
  healthPanel: { flex: 1, minWidth: 280 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  panelTitle: { fontSize: 15, fontWeight: '800' },
  panelSubtitle: { fontSize: 11, marginTop: 4 },
  categoryRow: { marginBottom: 14 },
  categoryLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  categoryName: { fontSize: 11, fontWeight: '600' },
  categoryCount: { fontSize: 11, fontWeight: '700' },
  track: { height: 7, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 8 },
  healthChart: { alignItems: 'center', marginVertical: 6 },
  healthRing: { width: 145, height: 145, borderWidth: 13, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  ringNumber: { fontSize: 29, fontWeight: '800' },
  ringLabel: { fontSize: 10, marginTop: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 11 },
  legendValue: { fontSize: 12, fontWeight: '800' },
  expiryPanel: { borderWidth: 1, borderRadius: 17, padding: 20, marginTop: 15 },
  expiryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  expiryCard: { flex: 1, minWidth: 150, borderRadius: 13, padding: 17 },
  expiryValue: { fontSize: 25, fontWeight: '800' },
  expiryLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  footerInsight: { borderTopWidth: 1, paddingTop: 17, marginTop: 22, flexDirection: 'row', gap: 10, alignItems: 'center' },
  footerText: { fontSize: 11, flex: 1, lineHeight: 18 },
});

export default ReportsScreen;
