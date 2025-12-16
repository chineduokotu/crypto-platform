import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await authStorage.getUserData();
    setFullName(userData.fullName || 'User');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authStorage.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const accountItems = [
    { icon: 'person-outline', label: 'My Profile', screen: 'MyProfile' },
    { icon: 'time-outline', label: 'History', screen: 'TransactionHistory' },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help' },
  ];
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Card */}
          <View style={[styles.profileCard, isDark && styles.cardDark]}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
              </View>
              <Text style={[styles.fullName, isDark && styles.textDark]}>{fullName}</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Account</Text>
            <View style={[styles.card, isDark && styles.cardDark]}>
              {accountItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    index !== accountItems.length - 1 && styles.menuItemBorder,
                    isDark && styles.menuItemBorderDark,
                  ]}
                  onPress={() => navigation.navigate(item.screen as any)}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isDark ? '#9ca3af' : '#6b7280'}
                    />
                    <Text style={[styles.menuItemText, isDark && styles.textDark]}>
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preference Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Preference</Text>
            <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="moon-outline"
                    size={20}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <Text style={[styles.menuItemText, isDark && styles.textDark]}>
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#d1d5db', true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          {/* Privacy & Security Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              Privacy & Security
            </Text>
            <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.securityContainer}>
                <View style={styles.securityIcon}>
                  <Ionicons name="shield-checkmark" size={24} color="#fff" />
                </View>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="home-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AddMoney')}
        >
          <Ionicons name="wallet-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={{ fontSize: 24 }}>❓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
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
  scrollView: { flex: 1 },
  content: { padding: spacing.lg },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemBorderDark: {
    borderBottomColor: '#374151',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  securityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutContainer: {
    marginBottom: spacing.lg,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonDark: {
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    borderColor: '#7f1d1d',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
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
