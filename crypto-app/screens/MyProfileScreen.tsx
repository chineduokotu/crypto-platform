import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function MyProfileScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userData = await authStorage.getUserData();
    if (!userData.userId) {
      Alert.alert('Error', 'You must be logged in');
      navigation.goBack();
      return;
    }

    try {
      const response = await apiClient.get(`/get_profile.php?userId=${userData.userId}`);
      if (response.data.success) {
        setFormData({
          firstName: response.data.user.first_name || '',
          lastName: response.data.user.last_name || '',
          email: response.data.user.email || '',
          phoneNumber: response.data.user.phone_number || '',
          address: response.data.user.address || '',
          dateOfBirth: response.data.user.date_of_birth || '',
        });
      } else {
        Alert.alert('Error', response.data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert('Error', 'First name, last name, and email are required');
      return;
    }

    const userData = await authStorage.getUserData();
    if (!userData.userId) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/update_profile.php', {
        userId: userData.userId,
        ...formData,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Name Fields */}
          <View style={styles.rowContainer}>
            <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={[styles.label, isDark && styles.labelDark]}>First Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => handleChange('firstName', value)}
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                />
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleChange('lastName', value)}
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => handleChange('phoneNumber', value)}
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Address"
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Date of Birth</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChangeText={(value) => handleChange('dateOfBirth', value)}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View> 

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  containerDark: { backgroundColor: '#111827' },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#6b7280',
  },
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
  scrollView: { flex: 1, padding: spacing.lg },
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
  rowContainer: {
    flexDirection: 'row',
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: spacing.xs,
  },
  labelDark: {
    color: '#d1d5db',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: 15,
    color: '#111827',
  },
  inputDark: {
    color: '#f9fafb',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
