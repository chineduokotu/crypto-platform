import React, { useState } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function KYCScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const documentTypes = [
    { id: 'nin', name: 'National ID (NIN)', icon: 'person', description: 'Nigerian National Identification Number' },
    { id: 'drivers', name: "Driver's License", icon: 'card', description: "Valid driver's license" },
    { id: 'passport', name: 'International Passport', icon: 'document-text', description: 'Nigerian international passport' },
  ];

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Document picker error:', error);
    }
  };

  const handleSubmitKYC = async () => {
    const userData = await authStorage.getUserData();
    const userId = userData.userId;

    if (!userId) {
      Alert.alert('Error', 'User not identified');
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('address', address);
    formData.append('dateOfBirth', dateOfBirth);

    if (document) {
      formData.append('documentFile', {
        uri: document.uri,
        type: document.mimeType || 'image/jpeg',
        name: document.name || 'document.jpg',
      } as any);
      formData.append('documentType', documentType);
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/kyc.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.replace('Dashboard');
        }, 2500);
      } else {
        Alert.alert('Error', response.data.error || 'KYC submission failed');
      }
    } catch (error) {
      console.error('KYC error:', error);
      Alert.alert('Error', 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[styles.stepDot, s <= step && styles.stepDotActive]}
        />
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={isDark ? ['#111827', '#1f2937', '#374151'] : [colors.primary, colors.secondary, '#3b82f6']}
      style={styles.container}
    >
      {/* Theme Toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={styles.themeToggle}
      >
        <Ionicons
          name={isDark ? 'sunny' : 'moon'}
          size={24}
          color={isDark ? '#fbbf24' : '#fff'}
        />
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => step > 1 ? setStep(step - 1) : navigation.navigate('Register')}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color="#fff" />
          </View>
          <Text style={[styles.title, isDark && styles.textDark]}>Verify Your Identity</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Complete KYC to access all features</Text>

          {renderStepIndicator()}

          {/* Step 1: Document Type */}
          {step === 1 && (
            <View>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Choose Document Type</Text>
              {documentTypes.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.docTypeCard, isDark && styles.docTypeCardDark]}
                  onPress={() => {
                    setDocumentType(doc.id);
                    setStep(2);
                  }}
                >
                  <View style={styles.docIconContainer}>
                    <Ionicons name={doc.icon as any} size={24} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.docTypeName, isDark && styles.textDark]}>{doc.name}</Text>
                    <Text style={[styles.docTypeDesc, isDark && styles.subtitleDark]}>{doc.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <View>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Personal Information</Text>
              
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.buttonSecondaryText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.buttonPrimaryText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Document Upload */}
          {step === 3 && (
            <View>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Upload Document</Text>

              <TouchableOpacity style={[styles.uploadButton, isDark && styles.uploadButtonDark]} onPress={pickDocument}>
                <Ionicons name="cloud-upload-outline" size={48} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text style={[styles.uploadText, isDark && styles.subtitleDark]}>
                  {document ? document.name : 'Tap to upload document'}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary, isDark && styles.buttonSecondaryDark]}
                  onPress={() => setStep(2)}
                >
                  <Text style={[styles.buttonSecondaryText, isDark && styles.textDark]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, (loading || !document) && styles.buttonDisabled]}
                  onPress={handleSubmitKYC}
                  disabled={loading || !document}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonPrimaryText}>Submit KYC</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Success State */}
          {showSuccess && (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              </View>
              <Text style={[styles.successTitle, isDark && styles.textDark]}>KYC Submitted Successfully!</Text>
              <Text style={[styles.successText, isDark && styles.subtitleDark]}>
                Your documents are being reviewed. You'll be notified once verification is complete.
              </Text>
              <Text style={[styles.redirectText, isDark && styles.subtitleDark]}>Redirecting to dashboard...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  scrollView: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  cardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  textDark: {
    color: '#f9fafb',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  stepDotActive: { backgroundColor: colors.primary },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: '#111827',
  },
  docTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  docTypeCardDark: {
    backgroundColor: '#374151',
  },
  docIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  docTypeName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 2 },
  docTypeDesc: { fontSize: 12, color: '#6b7280' },
  inputWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: borderRadius.md,
    paddingLeft: 45,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#f9fafb',
  },
  uploadButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  uploadButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  uploadIcon: { fontSize: 32, marginBottom: spacing.sm },
  uploadText: { fontSize: 14, color: '#6b7280', marginTop: spacing.sm },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: '#e5e7eb' },
  buttonSecondaryDark: { backgroundColor: '#4b5563' },
  buttonDisabled: { opacity: 0.6 },
  buttonPrimaryText: { color: '#fff', fontWeight: '600' },
  buttonSecondaryText: { color: '#374151', fontWeight: '600' },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  redirectText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
