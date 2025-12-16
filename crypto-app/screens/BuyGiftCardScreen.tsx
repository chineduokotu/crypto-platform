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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

interface Giftcard {
  id: number;
  giftcard_name: string;
  exchange_rate: string;
}

interface BankAccount {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
}

export default function BuyGiftCardScreen({ navigation }: any) {
  const [giftcards, setGiftcards] = useState<Giftcard[]>([]);
  const [selectedGiftcard, setSelectedGiftcard] = useState<Giftcard | null>(null);
  const [exchangeRate, setExchangeRate] = useState('');
  const [cardValue, setCardValue] = useState('');
  const [nairaValue, setNairaValue] = useState('0.00');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchGiftcards();
  }, []);

  useEffect(() => {
    if (selectedGiftcard && cardValue) {
      const total = parseFloat(cardValue) * parseFloat(selectedGiftcard.exchange_rate);
      setNairaValue(total.toFixed(2));
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

  const handleGiftcardChange = async (giftcardId: string | number) => {
    if (!giftcardId) {
      setSelectedGiftcard(null);
      setExchangeRate('');
      setBankAccounts([]);
      return;
    }

    // Compare as strings to handle both number and string IDs
    const card = giftcards.find((g) => String(g.id) === String(giftcardId));
    if (card) {
      setSelectedGiftcard(card);
      setExchangeRate(card.exchange_rate);
      if (cardValue) {
        const total = parseFloat(cardValue) * parseFloat(card.exchange_rate);
        setNairaValue(total.toFixed(2));
      }

      // Fetch bank accounts
      try {
        const response = await apiClient.get('/get_accounts.php');
        if (response.data?.success) {
          setBankAccounts(response.data.accounts);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedGiftcard || !cardValue || !nairaValue) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const userData = await authStorage.getUserData();
    if (!userData.userId) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userData.userId);
    formData.append('card_type', selectedGiftcard.giftcard_name);
    formData.append('card_value', cardValue);
    formData.append('naira_value', nairaValue);
    formData.append('exchange_rate', exchangeRate);

    setLoading(true);
    try {
      const response = await apiClient.post('/buy_giftcard.php', formData);
      if (response.data.success) {
        Alert.alert('Success', 'Gift card purchased successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('TransactionHistory') },
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Purchase failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit purchase request');
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
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Buy Gift Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Gift Card Type */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Gift Card Type</Text>
            <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
              <Picker
                selectedValue={selectedGiftcard?.id ? String(selectedGiftcard.id) : ''}
                onValueChange={handleGiftcardChange}
                style={[styles.picker, isDark && styles.pickerDark]}
                dropdownIconColor={isDark ? '#f9fafb' : '#111827'}
              >
                <Picker.Item label="-- Select Gift Card --" value="" color={isDark ? '#f9fafb' : '#111827'} />
                {giftcards.map((card) => (
                  <Picker.Item key={card.id} label={card.giftcard_name} value={String(card.id)} color={isDark ? '#f9fafb' : '#111827'} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Card Value */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Card Value (USD)</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
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

          {/* Total Cost (Naira) */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Total Cost (NGN)</Text>
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="cash-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.inputDisabled, isDark && styles.inputDisabledDark]}
                value={`₦${nairaValue}`}
                editable={false}
              />
            </View>
          </View>

          {/* Bank Account Details */}
          {bankAccounts.length > 0 && (
            <View style={[styles.bankDetailsContainer, isDark && styles.bankDetailsContainerDark]}>
              <View style={styles.bankHeader}>
                <Ionicons name="business" size={20} color={isDark ? '#60a5fa' : colors.primary} />
                <Text style={[styles.bankTitle, isDark && styles.bankTitleDark]}>Bank Account Details</Text>
              </View>
              {bankAccounts.map((acc) => (
                <View key={acc.id} style={[styles.bankItem, isDark && styles.bankItemDark]}>
                  <Text style={[styles.bankName, isDark && styles.textDark]}>{acc.bank_name}</Text>
                  <View style={styles.bankRow}>
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text style={[styles.bankText, isDark && styles.bankTextDark]}>
                      Account Name: {acc.account_name}
                    </Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Ionicons name="card-outline" size={16} color="#6b7280" />
                    <Text style={[styles.bankText, isDark && styles.bankTextDark]}>
                      Account Number: {acc.account_number}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Buy Gift Card</Text>
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
  bankDetailsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bankDetailsContainerDark: {
    backgroundColor: '#1f2937',
    borderColor: '#4b5563',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  bankTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  bankTitleDark: {
    color: '#f9fafb',
  },
  bankItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: spacing.sm,
  },
  bankItemDark: {
    borderBottomColor: '#4b5563',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  bankText: {
    fontSize: 13,
    color: '#4b5563',
  },
  bankTextDark: {
    color: '#9ca3af',
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