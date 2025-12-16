import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const userData = await authStorage.getUserData();
    if (!userData.userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/get_notifications.php?userId=${userData.userId}`);
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons 
            name="notifications" 
            size={20} 
            color={isDark ? '#60a5fa' : colors.primary} 
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Notifications</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchNotifications}
                colors={[colors.primary]}
              />
            }
          >
            {loading && notifications.length === 0 ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
                  Loading notifications...
                </Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.centerContent}>
                <Ionicons 
                  name="notifications-off-outline" 
                  size={64} 
                  color={isDark ? '#4b5563' : '#9ca3af'} 
                />
                <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                  No notifications found.
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.map((notif, index) => (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.notificationItem,
                      index !== notifications.length - 1 && styles.notificationBorder,
                      isDark && styles.notificationBorderDark,
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationContent}>
                      <View>
                        <Text style={[styles.notificationTitle, isDark && styles.textDark]}>
                          {notif.title}
                        </Text>
                        <Text style={[styles.notificationBody, isDark && styles.textSecondaryDark]}>
                          {notif.message_body}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.notificationDate, isDark && styles.textSecondaryDark]}>
                      {new Date(notif.created_at).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
          <Ionicons name="notifications" size={24} color={isDark ? '#60a5fa' : colors.primary} />
          <Text style={[styles.navLabel, styles.navLabelActive, isDark && styles.navLabelActiveDark]}>Notifications</Text>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  scrollView: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  notificationsList: {
    paddingVertical: 0,
  },
  notificationItem: {
    padding: spacing.lg,
  },
  notificationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  notificationBorderDark: {
    borderBottomColor: '#374151',
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  notificationDate: {
    fontSize: 11,
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
