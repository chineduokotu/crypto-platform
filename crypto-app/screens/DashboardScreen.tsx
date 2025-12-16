import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardScreen({ navigation }: any) {
  const [balance, setBalance] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const userData = await authStorage.getUserData();
    setFullName(userData.fullName || 'User');

    if (userData.userId) {
      fetchBalance(userData.userId);
    }
  };

  const fetchBalance = async (userId: string) => {
    try {
      const response = await apiClient.get(`/get_balance.php?userId=${userId}`);
      if (response.data.success) {
        setBalance(parseFloat(response.data.balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await authStorage.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  // All services - available and unavailable
  const services = [
    // Available services
    { id: 'ExchangeCrypto', name: 'Exchange Crypto to Naira', icon: 'logo-bitcoin', color: ['#f59e0b', '#ef4444'], available: true },
    { id: 'ExchangeGiftCard', name: 'Exchange Gift Cards to Naira', icon: 'card', color: ['#3b82f6', '#14b8a6'], available: true },
    { id: 'BuyCrypto', name: 'Buy Cryptocurrency', icon: 'cash', color: ['#10b981', '#059669'], available: true },
    { id: 'BuyGiftCard', name: 'Buy Gift Cards', icon: 'gift', color: ['#ec4899', '#ef4444'], available: true },
    
    // Unavailable services
    { id: 'airtime', name: 'Airtime', icon: 'phone-portrait', color: ['#a855f7', '#ec4899'], available: false },
    { id: 'data', name: 'Data', icon: 'wifi', color: ['#3b82f6', '#a855f7'], available: false },
    { id: 'electricity', name: 'Electricity', icon: 'flash', color: ['#f97316', '#dc2626'], available: false },
    { id: 'tv', name: 'TV Subscription', icon: 'tv', color: ['#10b981', '#3b82f6'], available: false },
    { id: 'internet', name: 'Internet', icon: 'wifi', color: ['#06b6d4', '#3b82f6'], available: false },
    { id: 'gift-user', name: 'Gift User', icon: 'gift', color: ['#ec4899', '#a855f7'], available: false },
    { id: 'esim', name: 'E-Sim', icon: 'card', color: ['#6366f1', '#a855f7'], available: false },
    { id: 'transport', name: 'Transport', icon: 'bus', color: ['#eab308', '#f97316'], available: false },
    { id: 'ticket', name: 'Ticket', icon: 'ticket', color: ['#dc2626', '#eab308'], available: false },
    { id: 'store', name: 'Store', icon: 'storefront', color: ['#10b981', '#eab308'], available: false },
    { id: 'redeem', name: 'Redeem Voucher', icon: 'pricetag', color: ['#3b82f6', '#10b981'], available: false },
    { id: 'virtualcard', name: 'Virtual Card', icon: 'card', color: ['#a855f7', '#3b82f6'], available: false },
    { id: 'flight', name: 'Flight', icon: 'airplane', color: ['#06b6d4', '#6366f1'], available: false },
    { id: 'education', name: 'Education', icon: 'school', color: ['#f97316', '#ec4899'], available: false },
    { id: 'alexai', name: 'Alex AI Assistant', icon: 'chatbubbles', color: ['#6b7280', '#3b82f6'], available: false },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {fullName.substring(0, 4).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.welcomeText, isDark && styles.textDark]}>Welcome</Text>
              <Text style={[styles.nameText, isDark && styles.textDark]}>{fullName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={isDark ? '#fbbf24' : '#9ca3af'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboardData} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCardContainer}>
          <LinearGradient 
            colors={isDark ? ['#1f2937', '#374151'] : [colors.primary, colors.secondary]} 
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                {loading ? (
                  <Text style={styles.balanceAmount}>Fetching balance...</Text>
                ) : (
                  <Text style={styles.balanceAmount}>
                    ₦{balance !== null ? balance.toLocaleString() : '0.00'}
                  </Text>
                )}
                <Ionicons name="eye-outline" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 8 }} />
              </View>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('TransactionHistory')}
              >
                <Ionicons name="time-outline" size={16} color="#fff" />
                <Text style={styles.historyButtonText}>History</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={() => navigation.navigate('AddMoney')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>

            <View style={styles.balanceDecoration} />
          </LinearGradient>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesContainer}>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isDark && styles.serviceCardDark,
                  !service.available && styles.serviceCardDisabled,
                ]}
                onPress={() => service.available && navigation.navigate(service.id)}
                disabled={!service.available}
              >
                <LinearGradient
                  colors={service.color as any}
                  style={[
                    styles.serviceIconContainer,
                    !service.available && styles.serviceIconDisabled,
                  ]}
                >
                  <Ionicons name={service.icon as any} size={24} color="#fff" />
                </LinearGradient>
                <View style={styles.serviceNameContainer}>
                  <Text style={[styles.serviceName, isDark && styles.textDark]} numberOfLines={2}>
                    {service.name}
                  </Text>
                  {!service.available && (
                    <Ionicons name="lock-closed" size={14} color="#9ca3af" style={{ marginLeft: 4 }} />
                  )}
                </View>
                {!service.available && (
                  <Text style={styles.unavailableTag}>Unavailable</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Ionicons name="home" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AddMoney')}>
          <Ionicons name="wallet-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  containerDark: { backgroundColor: '#111827' },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  headerDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderBottomColor: 'rgba(75, 85, 99, 0.5)',
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  welcomeText: { fontSize: 12, color: '#6b7280' },
  nameText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  textDark: { color: '#f9fafb' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 4 },
  scrollView: { flex: 1 },
  balanceCardContainer: { padding: spacing.lg },
  balanceCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceInfo: { flexDirection: 'row', alignItems: 'center' },
  balanceAmount: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  historyButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'flex-start',
    gap: 4,
  },
  addMoneyText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  balanceDecoration: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  servicesContainer: { paddingHorizontal: spacing.md },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    marginBottom: spacing.md,
  },
  serviceCardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  serviceCardDisabled: {
    backgroundColor: 'rgba(229, 231, 235, 0.5)',
    opacity: 0.6,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  serviceIconDisabled: {
    opacity: 0.3,
  },
  serviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: { fontSize: 10, fontWeight: '500', textAlign: 'center', color: '#111827', paddingHorizontal: 2 },
  unavailableTag: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 8,
    color: '#9ca3af',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
  },
  bottomNavDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderTopColor: 'rgba(75, 85, 99, 0.5)',
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
