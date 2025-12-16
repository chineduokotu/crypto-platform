import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function TransactionHistoryScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const userData = await authStorage.getUserData();
    if (!userData.userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/get_transactions.php?userId=${userData.userId}`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return { bg: '#d1fae5', text: '#065f46' };
      case 'pending': return { bg: '#fef3c7', text: '#b45309' };
      case 'rejected': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tableScroll}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchTransactions}
                colors={[colors.primary]}
              />
            }
          >
            <View style={styles.table}>
              {loading && transactions.length === 0 ? (
                <View style={styles.centerContent}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
                    Loading transactions...
                  </Text>
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.centerContent}>
                  <Ionicons 
                    name="receipt-outline" 
                    size={64} 
                    color={isDark ? '#4b5563' : '#9ca3af'} 
                  />
                  <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                    No transactions found.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Table Header */}
                  <View style={[styles.tableHeader, isDark && styles.tableHeaderDark]}>
                    <Text style={[styles.headerCell, styles.cellNumber]}>{'#'}</Text>
                    <Text style={[styles.headerCell, styles.cellWallet]}>Wallet</Text>
                    <Text style={[styles.headerCell, styles.cellAmount]}>Amount</Text>
                    <Text style={[styles.headerCell, styles.cellStatus]}>Status</Text>
                    <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
                  </View>

                  {/* Table Body */}
                  {transactions.map((tx, index) => {
                    const statusColors = getStatusColor(tx.status);
                    return (
                      <View
                        key={tx.id}
                        style={[
                          styles.tableRow,
                          isDark && styles.tableRowDark,
                          index !== transactions.length - 1 && styles.tableRowBorder,
                          isDark && styles.tableRowBorderDark,
                        ]}
                      >
                        <Text style={[styles.cellText, styles.cellNumber, isDark && styles.textDark]}>
                          {index + 1}
                        </Text>
                        <Text style={[styles.cellText, styles.cellWallet, isDark && styles.textDark]}>
                          {tx.wallet_name}
                        </Text>
                        <Text style={[styles.cellText, styles.cellAmount, styles.amountText, isDark && styles.textDark]}>
                          ₦{parseFloat(tx.amount).toLocaleString()}
                        </Text>
                        <View style={styles.cellStatus}>
                          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                            <Text style={[styles.statusText, { color: statusColors.text }]}>
                              {tx.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.cellText, styles.cellDate, styles.dateText, isDark && styles.textSecondaryDark]}>
                          {new Date(tx.created_at).toLocaleString()}
                        </Text>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="home-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={[styles.navLabel, isDark && styles.navLabelDark]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AddMoney')}
        >
          <Ionicons name="wallet-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={[styles.navLabel, isDark && styles.navLabelDark]}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="time" size={24} color={isDark ? '#60a5fa' : colors.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive, isDark && styles.navLabelActiveDark]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={[styles.navLabel, isDark && styles.navLabelDark]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  containerDark: { backgroundColor: '#111827' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  headerDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderBottomColor: 'rgba(75, 85, 99, 0.5)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  textDark: { color: '#f9fafb' },
  textSecondaryDark: { color: '#d1d5db' },
  contentContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  tableScroll: {
    flex: 1,
  },
  table: {
    minWidth: 600,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    minWidth: 600,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#6b7280',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderDark: {
    backgroundColor: '#374151',
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableRowDark: {
    backgroundColor: '#1f2937',
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowBorderDark: {
    borderBottomColor: '#4b5563',
  },
  cellText: {
    fontSize: 13,
    color: '#111827',
  },
  cellNumber: { width: 50 },
  cellWallet: { width: 120 },
  cellAmount: { width: 120 },
  cellStatus: { width: 120 },
  cellDate: { width: 190 },
  amountText: {
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    color: '#6b7280',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
  },
  bottomNavDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderTopColor: 'rgba(75, 85, 99, 0.5)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#6b7280',
  },
  navLabelDark: {
    color: '#9ca3af',
  },
  navLabelActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  navLabelActiveDark: {
    color: '#60a5fa',
  },
});