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

export default function ExchangeGiftCardScreen({ navigation }: any) {
  const [giftcards, setGiftcards] = useState<any[]>([]);
  const [selectedGiftcard, setSelectedGiftcard] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState('');
  const [cardValue, setCardValue] = useState('');
  const [nairaValue, setNairaValue] = useState('0.00');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [proofImage, setProofImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchGiftcards();
  }, []);

  useEffect(() => {
    if (selectedGiftcard && cardValue) {
      const rate = parseFloat(selectedGiftcard.exchange_rate) || 0;
      const value = parseFloat(cardValue) || 0;
      setNairaValue((rate * value).toFixed(2));
    }
  }, [cardValue, selectedGiftcard]);

  const fetchGiftcards = async () => {
    try {
      const response = await apiClient.get('/get_giftcards.php');
      if (response.data?.success) {
        setGiftcards(response.data.giftcards);
      }
    } catch (error) {
      console.error('Error fetching giftcards:', error);
    }
  };

  const handleGiftcardChange = (giftcardId: string) => {
    const card = giftcards.find((g) => g.id === parseInt(giftcardId));
    if (card) {
      setSelectedGiftcard(card);
      setExchangeRate(card.exchange_rate);
      if (cardValue) {
        const value = parseFloat(cardValue) * parseFloat(card.exchange_rate);
        setNairaValue(value.toFixed(2));
      }
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
    if (!selectedGiftcard || !cardValue || !proofImage || !bankName || !accountName || !accountNumber) {
      Alert.alert('Error', 'Please fill all fields and upload proof');
      return;
    }

    const userData = await authStorage.getUserData();
    const formData = new FormData();
    formData.append('user_id', userData.userId || '');
    formData.append('card_type', selectedGiftcard.giftcard_name);
    formData.append('card_value', cardValue);
    formData.append('naira_value', nairaValue);
    formData.append('exchange_rate', exchangeRate);
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
      const response = await apiClient.post('/exchange_giftcard.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        Alert.alert('Success', 'Gift card exchange request submitted successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('TransactionHistory') },
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Submission failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exchange request');
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
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Exchange Gift Card to Naira</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Gift Card Type */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Gift Card Type</Text>
            <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
              <Picker
                selectedValue={selectedGiftcard?.id}
                onValueChange={handleGiftcardChange}
                style={[styles.picker, isDark && styles.pickerDark]}
                dropdownIconColor={isDark ? '#f9fafb' : '#111827'}
              >
                <Picker.Item label="-- Select Gift Card --" value={null} color={isDark ? '#f9fafb' : '#111827'} />
                {giftcards.map((card) => (
                  <Picker.Item key={card.id} label={card.giftcard_name} value={card.id} color={isDark ? '#f9fafb' : '#111827'} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Exchange Rate */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Exchange Rate</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.inputDisabled, isDark && styles.inputDisabledDark]}
                value={exchangeRate}
                editable={false}
              />
            </View>
          </View>

          {/* Card Value */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Card Value (USD)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter card value"
                value={cardValue}
                onChangeText={setCardValue}
                keyboardType="numeric"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Naira Value */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Naira Value (₦)</Text>
            <View style={styles.inputWrapper}>
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
            <View style={styles.inputWrapper}>
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
            <View style={styles.inputWrapper}>
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
            <View style={styles.inputWrapper}>
              <Ionicons name="keypad-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
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
            <Text style={[styles.label, isDark && styles.labelDark]}>Upload Proof of Gift Card</Text>
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
