import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

interface WalletType {
  id: number;
  wallet_name: string;
  exchange_rate_buy: number;
}

interface AccountType {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
}

const BuyCrypto: React.FC = () => {
  const navigation = useNavigation();

  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [cryptoValue, setCryptoValue] = useState<string>("0.00");
  const [paymentProof, setPaymentProof] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isDark } = useTheme();

  // Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await apiClient.get('/get_wallets.php');
        if (res.data?.success && Array.isArray(res.data.wallets)) {
          const mapped: WalletType[] = res.data.wallets.map((w: any) => ({
            id: Number(w.id ?? 0),
            wallet_name: String(w.wallet_name ?? ""),
            exchange_rate_buy: Number(w.exchange_rate_buy ?? 0),
          }));
          setWallets(mapped);
        }
      } catch (err) {
        console.error("Failed to load wallets:", err);
      }
    };
    fetchWallets();
  }, []);

  // Fetch bank account details
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await apiClient.get('/get_accounts.php');
        if (res.data?.success && Array.isArray(res.data.accounts)) {
          const mapped: AccountType[] = res.data.accounts.map((a: any) => ({
            id: Number(a.id ?? 0),
            account_name: String(a.account_name ?? ""),
            account_number: String(a.account_number ?? ""),
            bank_name: String(a.bank_name ?? ""),
          }));
          setAccounts(mapped);
          if (mapped.length === 1) setSelectedAccount(mapped[0]);
        }
      } catch (err) {
        console.error("Failed to load accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  // Calculate crypto equivalent
  useEffect(() => {
    const rate = selectedWallet?.exchange_rate_buy ?? 0;
    if (amount && !isNaN(Number(amount)) && rate > 0) {
      const crypto = Number(amount) / rate;
      setCryptoValue(crypto.toFixed(6));
    } else {
      setCryptoValue("0.00");
    }
  }, [amount, selectedWallet]);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera roll permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPaymentProof(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedWallet) return Alert.alert("Error", "Please choose a wallet.");
    if (!selectedAccount) return Alert.alert("Error", "Account details not loaded.");
    if (!amount || Number(amount) <= 0) return Alert.alert("Error", "Enter a valid amount.");
    if (!paymentProof) return Alert.alert("Error", "Upload a payment proof image.");

    const userData = await authStorage.getUserData();
    if (!userData.userId) return Alert.alert("Error", "You must be logged in.");

    const formData = new FormData();
    formData.append("user_id", userData.userId);
    formData.append("wallet_name", selectedWallet.wallet_name);
    formData.append("exchange_rate_buy", String(selectedWallet.exchange_rate_buy));
    formData.append("account_name", selectedAccount.account_name);
    formData.append("account_number", selectedAccount.account_number);
    formData.append("bank_name", selectedAccount.bank_name);
    formData.append("amount", String(amount));

    // Append image file
    const uriParts = paymentProof.uri.split(".");
    const fileType = uriParts[uriParts.length - 1];
    formData.append("payment_proof", {
      uri: paymentProof.uri,
      name: `payment_proof.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      setLoading(true);
      const res = await apiClient.post('/save_payment.php', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📦 Raw server response:", res.data);

      if (res.data?.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate("TransactionHistory" as never);
        }, 2500);
      } else {
        console.error("❌ Server error:", res.data?.error || res.data);
        Alert.alert("Error", res.data?.error || "Unknown error");
      }
    } catch (err) {
      console.error("❌ Axios/Network error:", err);
      Alert.alert("Error", "Error while submitting payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#f9fafb' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Buy Cryptocurrency</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Card Content */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Wallet Select */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Select Wallet</Text>
            <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
              <Picker
                selectedValue={selectedWallet ? String(selectedWallet.id) : ""}
                onValueChange={(value) => {
                  if (value === "") {
                    setSelectedWallet(null);
                    return;
                  }
                  const selectedId = Number(value);
                  const wallet = wallets.find((w) => w.id === selectedId) ?? null;
                  setSelectedWallet(wallet);
                }}
                style={[styles.picker, isDark && styles.pickerDark]}
                dropdownIconColor={isDark ? '#f9fafb' : '#111827'}
              >
                <Picker.Item label="-- Choose Wallet --" value="" color={isDark ? '#f9fafb' : '#111827'} />
                {wallets.map((wallet) => (
                  <Picker.Item
                    key={wallet.id}
                    label={wallet.wallet_name}
                    value={String(wallet.id)}
                    color={isDark ? '#f9fafb' : '#111827'}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Account Details Section */}
          {selectedWallet && selectedAccount && (
            <View style={[styles.accountDetails, isDark && styles.accountDetailsDark]}>
              <Text style={[styles.accountTitle, isDark && styles.textDark]}>🏦 Pay to this Bank Account:</Text>
              <Text style={[styles.accountText, isDark && styles.textSecondaryDark]}>
                <Text style={[styles.bold, isDark && styles.textDark]}>Bank:</Text> {selectedAccount.bank_name}
              </Text>
              <Text style={[styles.accountText, isDark && styles.textSecondaryDark]}>
                <Text style={[styles.bold, isDark && styles.textDark]}>Account Name:</Text> {selectedAccount.account_name}
              </Text>
              <Text style={[styles.accountText, isDark && styles.textSecondaryDark]}>
                <Text style={[styles.bold, isDark && styles.textDark]}>Account Number:</Text> {selectedAccount.account_number}
              </Text>
            </View>
          )}

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Amount (₦)</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter amount"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Crypto Equivalent */}
          {selectedWallet && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.textDark]}>Crypto Equivalent</Text>
              <TextInput
                style={[styles.input, styles.disabledInput, isDark && styles.disabledInputDark]}
                value={`${cryptoValue} ${selectedWallet.wallet_name}`}
                editable={false}
              />
            </View>
          )}

          {/* Upload Proof */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Upload Payment Proof</Text>
            <TouchableOpacity style={[styles.uploadButton, isDark && styles.uploadButtonDark]} onPress={pickImage}>
              <Ionicons name={paymentProof ? "checkmark-circle" : "cloud-upload-outline"} size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
              <Text style={[styles.uploadButtonText, isDark && styles.uploadTextDark]}>
                {paymentProof ? "Image Selected ✓" : "Choose Image"}
              </Text>
            </TouchableOpacity>
            {paymentProof && (
              <Text style={styles.fileName}>{paymentProof.fileName || "Image selected"}</Text>
            )}
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
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Success!</Text>
            <Text style={[styles.modalText, isDark && styles.textDark]}>
              Your crypto purchase request was submitted successfully.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard" as never)}
        >
          <Ionicons name="home-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AddMoney" as never)}
        >
          <Ionicons name="wallet-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Help" as never)}
        >
          <Text style={styles.navEmoji}>❓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile" as never)}
        >
          <Ionicons name="person-outline" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  containerDark: {
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.)', // Using transparent or matching background
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  backButton: {
    padding: 4,
  },
  textDark: {
    color: "#f9fafb",
  },
  textSecondaryDark: {
    color: "#d1d5db",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "#1f2937",
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  pickerContainerDark: {
    backgroundColor: "#374151",
    borderColor: "#4b5563",
  },
  picker: {
    color: "#111827",
  },
  pickerDark: {
    color: "#f9fafb",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  inputDark: {
    backgroundColor: "#374151",
    borderColor: "#4b5563",
    color: "#f9fafb",
  },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  disabledInputDark: {
    backgroundColor: '#4b5563',
    color: '#d1d5db',
    borderColor: '#4b5563',
  },
  accountDetails: {
    backgroundColor: "#f9fafb",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  accountDetailsDark: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderColor: '#4b5563',
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  accountText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
    color: "#1f2937",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: borderRadius.md,
    padding: 16,
    borderStyle: 'dashed',
    backgroundColor: "#f9fafb",
  },
  uploadButtonDark: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderColor: '#4b5563',
  },
  uploadButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  uploadTextDark: {
    color: '#d1d5db',
  },
  fileName: {
    fontSize: 12,
    color: "#10b981",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: 16,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    maxWidth: 300,
  },
  modalContentDark: {
    backgroundColor: "#1f2937",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
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
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navEmoji: {
    fontSize: 24,
  },
});

export default BuyCrypto;