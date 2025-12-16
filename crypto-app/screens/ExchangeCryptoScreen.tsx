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
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function ExchangeCryptoScreen({ navigation }: any) {
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [nairaValue, setNairaValue] = useState('0.00');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [proofImage, setProofImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    const rate = selectedWallet?.exchange_rate_buy || 0;
    const amount = Number(cryptoAmount) || 0;
    setNairaValue((rate * amount).toFixed(2));
  }, [cryptoAmount, selectedWallet]);

  const fetchWallets = async () => {
    try {
      const response = await apiClient.get('/get_wallets.php');
      if (response.data?.success) setWallets(response.data.wallets);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setProofImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!selectedWallet || !cryptoAmount || !proofImage || !bankName || !accountName || !accountNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const userData = await authStorage.getUserData();
    const formData = new FormData();
    formData.append('user_id', userData.userId || '');
    formData.append('wallet_name', selectedWallet.wallet_name);
    formData.append('wallet_address', selectedWallet.wallet_address);
    formData.append('crypto_amount', cryptoAmount);
    formData.append('naira_value', nairaValue);
    formData.append('exchange_rate', selectedWallet.exchange_rate_buy);
    formData.append('bank_name', bankName);
    formData.append('account_name', accountName);
    formData.append('account_number', accountNumber);
    formData.append('proof_image', {
      uri: proofImage.uri,
      type: 'image/jpeg',
      name: 'proof.jpg',
    } as any);

    setLoading(true);
    try {
      const response = await apiClient.post('/exchange_crypto.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        Alert.alert('Success', 'Exchange request submitted!', [
          { text: 'OK', onPress: () => navigation.navigate('TransactionHistory') },
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Submission failed');
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
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Exchange Crypto to Naira</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Select Wallet */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Select Wallet</Text>
            <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
              <Picker
                selectedValue={selectedWallet?.id}
                onValueChange={(val) => {
                  // Compare as strings to be safe
                  setSelectedWallet(wallets.find((w) => String(w.id) === String(val)) || null);
                }}
                style={[styles.picker, isDark && styles.pickerDark]}
                dropdownIconColor={isDark ? '#f9fafb' : '#111827'}
              >
                <Picker.Item label="-- Choose Wallet --" value={null} color={isDark ? '#f9fafb' : '#111827'} />
                {wallets.map((w) => (
                  <Picker.Item key={w.id} label={w.wallet_name} value={w.id} color={isDark ? '#f9fafb' : '#111827'} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Wallet Info */}
          {selectedWallet && (
            <View style={[styles.info, isDark && styles.infoDark]}>
              <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={16} color={isDark ? '#60a5fa' : colors.primary} />
                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                  Address: {selectedWallet.wallet_address}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color={isDark ? '#60a5fa' : colors.primary} />
                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                  Rate: ₦{selectedWallet.exchange_rate_buy}/unit
                </Text>
              </View>
            </View>
          )}

          {/* Crypto Amount */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Crypto Amount</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="logo-bitcoin" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter crypto amount"
                value={cryptoAmount}
                onChangeText={setCryptoAmount}
                keyboardType="numeric"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Naira Value */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Naira Value (₦)</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="cash-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.inputDisabled, isDark && styles.inputDisabledDark]}
                value={nairaValue}
                editable={false}
              />
            </View>
          </View>

          {/* Bank Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Bank Name</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Account Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Account Name</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter account name"
                value={accountName}
                onChangeText={setAccountName}
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Account Number</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Upload Proof */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Upload Proof of Transaction</Text>
            <TouchableOpacity
              style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
              onPress={pickImage}
            >
              <Ionicons
                name={proofImage ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={24}
                color={proofImage ? '#059669' : (isDark ? '#6b7280' : '#9ca3af')}
              />
              <Text style={[styles.uploadText, isDark && styles.uploadTextDark, proofImage && styles.uploadTextSuccess]}>
                {proofImage ? 'Image Selected' : 'Tap to Upload'}
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
              <Text style={styles.submitButtonText}>Submit Exchange Request</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'center', marginRight: 24 },
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
  info: {
    backgroundColor: '#eff6ff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  infoDark: {
    backgroundColor: '#1e3a8a',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    flex: 1,
  },
  infoTextDark: {
    color: '#bfdbfe',
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
  inputWrapperDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
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
  inputDisabled: {
    flex: 1,
    padding: spacing.md,
    fontSize: 15,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
  },
  inputDisabledDark: {
    color: '#9ca3af',
    backgroundColor: '#374151',
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
});
