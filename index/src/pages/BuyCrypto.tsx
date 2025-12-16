import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Wallet, User, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(
    null
  );
  const [amount, setAmount] = useState<number | string>("");
  const [cryptoValue, setCryptoValue] = useState<string>("0.00");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get(
          "http://localhost//php/get_wallets.php"
        );
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
        const res = await axios.get(
          "http://localhost/cosmic-view-frames-main/public/php/get_accounts.php"
        );
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentProof(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWallet) return alert("⚠️ Please choose a wallet.");
    if (!selectedAccount) return alert("⚠️ Account details not loaded.");
    if (!amount || Number(amount) <= 0) return alert("⚠️ Enter a valid amount.");
    if (!paymentProof) return alert("⚠️ Upload a payment proof image.");
    if (!userId) return alert("⚠️ You must be logged in.");

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("wallet_name", selectedWallet.wallet_name);
    formData.append(
      "exchange_rate_buy",
      String(selectedWallet.exchange_rate_buy)
    );
    formData.append("account_name", selectedAccount.account_name);
    formData.append("account_number", selectedAccount.account_number);
    formData.append("bank_name", selectedAccount.bank_name);
    formData.append("amount", String(amount));
    formData.append("payment_proof", paymentProof);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost/cosmic-view-frames-main/public/php/save_payment.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("📦 Raw server response:", res.data);

      if (res.data?.success) {
        setMessage("Order submitted successfully!");
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          navigate("/transaction-history");
        }, 2500);
      } else {
        console.error("❌ Server error:", res.data?.error || res.data);
        alert("❌ Failed: " + (res.data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Axios/Network error:", err);
      alert("⚠️ Error while submitting payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col justify-center items-center relative overflow-hidden">
      <Card className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl mb-20">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex justify-between items-center">
            Buy Cryptocurrency
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              ← Back
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="mt-4 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Wallet Select */}
            <div>
              <Label htmlFor="wallet">Select Wallet</Label>
              <select
                id="wallet"
                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                value={selectedWallet ? String(selectedWallet.id) : ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const wallet = wallets.find((w) => w.id === selectedId) ?? null;
                  setSelectedWallet(wallet);
                }}
              >
                <option value="">-- Choose Wallet --</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.wallet_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Details Section */}
            {selectedWallet && selectedAccount && (
              <div className="mt-3 border rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                  🏦 Pay to this Bank Account:
                </h3>
                <p>
                  <strong>Bank:</strong> {selectedAccount.bank_name}
                </p>
                <p>
                  <strong>Account Name:</strong> {selectedAccount.account_name}
                </p>
                <p>
                  <strong>Account Number:</strong> {selectedAccount.account_number}
                </p>
              </div>
            )}

            {/* Amount */}
            <div>
              <Label>Amount (₦)</Label>
              <Input
                type="text"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Crypto Equivalent */}
            {selectedWallet && (
              <div>
                <Label>Crypto Equivalent</Label>
                <Input
                  type="text"
                  value={`${cryptoValue} ${selectedWallet.wallet_name}`}
                  readOnly
                  className="cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                />
              </div>
            )}

            {/* Upload Proof */}
            <div>
              <Label>Upload Payment Proof</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-10 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Success!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                Your crypto purchase request was submitted successfully.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center p-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
          </Link>
          <Link to="/add-money" className="flex flex-col items-center p-2">
            <Wallet className="w-6 h-6 text-muted-foreground" />
          </Link>
          <Link to="/help" className="flex flex-col items-center p-2">
            <span className="text-2xl">❓</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-2">
            <User className="w-6 h-6 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyCrypto;
