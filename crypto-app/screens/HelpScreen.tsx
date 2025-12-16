import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export default function HelpScreen({ navigation }: any) {
  const { isDark } = useTheme();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@yourcompany.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+15551234567');
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isDark && styles.textDark]}>Need Help?</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Contact our support team below
            </Text>
          </View>

          {/* Contact Options */}
          <View style={styles.contactContainer}>
            {/* Email */}
            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1e40af' : '#dbeafe' }]}>
                <Ionicons name="mail" size={24} color={isDark ? '#60a5fa' : colors.primary} />
              </View>
              <Text style={[styles.contactText, isDark && styles.textDark]}>
                support@yourcompany.com
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1e40af' : '#dbeafe' }]}>
                <Ionicons name="call" size={24} color={isDark ? '#60a5fa' : colors.primary} />
              </View>
              <Text style={[styles.contactText, isDark && styles.textDark]}>
                +1 (555) 123-4567
              </Text>
            </View>

            {/* Location */}
            <View style={styles.contactItem}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1e40af' : '#dbeafe' }]}>
                <Ionicons name="location" size={24} color={isDark ? '#60a5fa' : colors.primary} />
              </View>
              <Text style={[styles.contactText, isDark && styles.textDark]}>
                123 Business Avenue, Lagos, Nigeria
              </Text>
            </View>
          </View>

          {/* Send Email Button */}
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.emailButtonText}>Send Email</Text>
          </TouchableOpacity>
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
          <View style={styles.navIconActive}>
            <Text style={styles.navEmoji}>❓</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  contactContainer: {
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  contactItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  emailButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emailButtonText: {
    color: '#fff',
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
  navEmoji: {
    fontSize: 18,
  },
});
