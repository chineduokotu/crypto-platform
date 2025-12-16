import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Wallet {
  id: number;
  wallet_name: string;
  wallet_address: string;
  exchange_rate_buy: number;
  exchange_rate_sell: number;
  created_at?: string;
}

// ✅ Toast component (slides in from right and auto-closes after 4s)
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${
            type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ExchangeCrypto: React.FC = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [nairaValue, setNairaValue] = useState<string>("0.00");
  const [bankName, setBankName] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "" }>({
    message: "",
    type: "",
  });

  // ✅ Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(
          "http://localhost/php/get_wallets.php"
        );

        if (res.data?.success && Array.isArray(res.data.wallets)) {
          const mapped: Wallet[] = res.data.wallets.map((w: any) => ({
            id: Number(w.id ?? 0),
            wallet_name: String(w.wallet_name ?? ""),
            wallet_address: String(w.wallet_address ?? ""),
            exchange_rate_buy: Number(w.exchange_rate_buy ?? 0),
            exchange_rate_sell: Number(w.exchange_rate_sell ?? 0),
            created_at: w.created_at ?? undefined,
          }));
          setWallets(mapped);
        } else {
          setWallets([]);
          console.error("Invalid wallet data format:", res.data);
        }
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
      }
    };

    fetchWallets();
  }, []);

  // ✅ Handle wallet selection
  const handleWalletSelect = (value: string) => {
    setSelectedWalletId(value);
    const id = Number(value);
    const found = wallets.find((w) => w.id === id) ?? null;

    if (found) {
      setSelectedWallet(found);
      setExchangeRate(found.exchange_rate_buy || 0);
    } else {
      setSelectedWallet(null);
      setExchangeRate(0);
    }
  };

  // ✅ Auto-calculate Naira equivalent
  useEffect(() => {
    const rate = Number(exchangeRate) || 0;
    const amount = Number(cryptoAmount) || 0;
    const naira = rate * amount;
    setNairaValue(naira > 0 ? naira.toFixed(2) : "0.00");
  }, [cryptoAmount, exchangeRate]);

  // ✅ Handle proof image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProofImage(e.target.files?.[0] ?? null);
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWallet)
      return setToast({ message: "Choose a wallet.", type: "error" });
    if (!cryptoAmount || Number(cryptoAmount) <= 0)
      return setToast({ message: "Enter crypto amount.", type: "error" });
    if (!proofImage)
      return setToast({ message: "Upload proof image.", type: "error" });
    if (!bankName || !accountName || !accountNumber)
      return setToast({ message: "Fill bank details.", type: "error" });
    if (!userId)
      return setToast({ message: "You must be logged in.", type: "error" });

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("wallet_name", selectedWallet.wallet_name);
    formData.append("wallet_address", selectedWallet.wallet_address);
    formData.append("crypto_amount", cryptoAmount);
    formData.append("naira_value", nairaValue);
    formData.append("exchange_rate", String(exchangeRate));
    formData.append("bank_name", bankName);
    formData.append("account_name", accountName);
    formData.append("account_number", accountNumber);
    formData.append("proof_image", proofImage);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost/cosmic-view-frames-main/public/php/exchange_crypto.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data?.success) {
        setToast({
          message: "Exchange request submitted — awaiting admin review.",
          type: "success",
        });
        setTimeout(() => navigate("/transaction-history"), 1500);
      } else {
        setToast({
          message: "Error: " + (res.data?.error || "Unknown error"),
          type: "error",
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setToast({
        message: "An error occurred while submitting your request.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex justify-center items-center">
      {/* ✅ Toast */}
      <Toast
        message={toast.message}
        type={toast.type as "success" | "error"}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <Card className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3 flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            Exchange Crypto to Naira
          </CardTitle>
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            ← Back
          </Button>
        </CardHeader>

        <CardContent className="mt-4 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Wallet Select */}
            <div>
              <Label htmlFor="wallet">Select Wallet</Label>
              <select
                id="wallet"
                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                value={selectedWalletId}
                onChange={(e) => handleWalletSelect(e.target.value)}
              >
                <option value="">-- Choose Wallet --</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={String(wallet.id)}>
                    {wallet.wallet_name}
                  </option>
                ))}
              </select>
              {wallets.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No wallets loaded.</p>
              )}
            </div>

            {/* Wallet Info */}
            {selectedWallet && (
              <>
                <div>
                  <Label>Wallet Address</Label>
                  <Input
                    type="text"
                    value={selectedWallet.wallet_address}
                    readOnly
                    className="cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <p className="text-blue-600 text-sm">
                    💱 Exchange Rate (Buy): ₦
                    {Number(exchangeRate).toLocaleString()} per unit
                  </p>
                </div>
              </>
            )}

            {/* Crypto Amount */}
            <div>
              <Label>Crypto Amount</Label>
              <Input
                type="text"
                step="any"
                placeholder="Enter amount in crypto"
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
              />
            </div>

            {/* Naira Value */}
            <div>
              <Label>Naira Value (₦)</Label>
              <Input
                type="text"
                value={nairaValue}
                readOnly
                className="cursor-not-allowed bg-gray-100 dark:bg-gray-700 font-semibold"
              />
            </div>

            {/* Bank Details */}
            <div>
              <Label>Bank Name</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>

            {/* Proof Upload */}
            <div>
              <Label>Upload Proof of Transaction</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Exchange Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeCrypto;
