import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function AddMoneyScreen({ navigation }: any) {
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentProof, setPaymentProof] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await apiClient.get('/get_wallets.php');
      if (response.data.success) {
        setWallets(response.data.wallets);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleWalletChange = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === parseInt(walletId));
    if (wallet) {
      setSelectedWallet(wallet);
      setWalletAddress(wallet.wallet_address);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPaymentProof(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedWallet || !amount || !paymentProof) {
      Alert.alert('Error', 'Please fill all fields and upload payment proof');
      return;
    }

    const userData = await authStorage.getUserData();
    if (!userData.userId) return;

    const formData = new FormData();
    formData.append('userId', userData.userId);
    formData.append('wallet_name', selectedWallet.wallet_name);
    formData.append('amount', amount);
    formData.append('wallet_address', walletAddress);
    formData.append('payment_proof', {
      uri: paymentProof.uri,
      type: 'image/jpeg',
      name: 'payment_proof.jpg',
    } as any);

    setLoading(true);
    try {
      const response = await apiClient.post('/submit_payment.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Payment submitted successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to submit payment');
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
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Add Money</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={[styles.card, isDark && styles.cardDark]}>
            {/* Wallet Dropdown */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Select Wallet</Text>
              <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                <Picker
                  selectedValue={selectedWallet?.id}
                  onValueChange={(itemValue) => handleWalletChange(String(itemValue))}
                  style={[styles.picker, isDark && styles.pickerDark]}
                  dropdownIconColor={isDark ? '#f9fafb' : '#111827'}
                >
                  <Picker.Item label="-- Choose Wallet --" value={null} color={isDark ? '#f9fafb' : '#111827'} />
                  {wallets.map((wallet) => (
                    <Picker.Item key={wallet.id} label={wallet.wallet_name} value={wallet.id} color={isDark ? '#f9fafb' : '#111827'} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Wallet Address */}
            {walletAddress ? (
              <View style={styles.formGroup}>
                <Text style={[styles.label, isDark && styles.labelDark]}>Wallet Address</Text>
                <TextInput
                  style={[styles.inputDisabled, isDark && styles.inputDisabledDark]}
                  value={walletAddress}
                  editable={false}
                />
              </View>
            ) : null}

            {/* Amount */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Amount (USD)</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>

            {/* Payment Proof */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Upload Payment Proof</Text>
              <TouchableOpacity
                style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
                onPress={pickImage}
              >
                <Ionicons
                  name={paymentProof ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={24}
                  color={paymentProof ? '#059669' : (isDark ? '#6b7280' : '#9ca3af')}
                />
                <Text style={[styles.uploadText, isDark && styles.uploadTextDark, paymentProof && styles.uploadTextSuccess]}>
                  {paymentProof ? 'Image Selected' : 'Tap to Upload'}
                </Text>
              </TouchableOpacity>
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
                <Text style={styles.submitButtonText}>Submit Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="home-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Ionicons name="wallet" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={{ fontSize: 24 }}>❓</Text>
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
  },
  contentContainer: {
    flex: 1,
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
  },
  pickerContainerDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  picker: {
    color: '#111827',
  },
  pickerDark: {
    color: '#f9fafb',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#f9fafb',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: '#6b7280',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputDisabledDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#9ca3af',
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  uploadButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  uploadText: {
    fontSize: 14,
    color: '#6b7280',
  },
  uploadTextDark: {
    color: '#9ca3af',
  },
  uploadTextSuccess: {
    color: '#059669',
    fontWeight: '500',
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
