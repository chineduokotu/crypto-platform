import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Home, Wallet, User } from "lucide-react";

const AddMoney = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [wallets, setWallets] = useState<{ wallet_name: string; wallet_address: string }[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await axios.get("http://localhost/php/get_wallets.php");
        if (res.data.success) {
          setWallets(res.data.wallets);
        } else {
          setToast({ message: res.data.error || "Failed to fetch wallets", type: "error" });
        }
      } catch (error) {
        console.error(error);
        setToast({ message: "Error fetching wallets.", type: "error" });
      }
    };

    fetchWallets();
  }, []);

  // Wallet change handler
  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedWallet(selected);

    const wallet = wallets.find((w) => w.wallet_name === selected);
    setWalletAddress(wallet ? wallet.wallet_address : "");
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedWallet || !amount || !paymentProof) {
      setToast({ message: "Please fill all fields and upload payment proof.", type: "error" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("wallet_name", selectedWallet);
    formData.append("amount", amount);
    formData.append("wallet_address", walletAddress);
    formData.append("payment_proof", paymentProof);

    try {
      const res = await axios.post(
        "http://localhost/cosmic-view-frames-main/public/php/submit_payment.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setToast({ message: "✅ Payment submitted successfully!", type: "success" });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setToast({ message: res.data.error || "Failed to submit payment.", type: "error" });
      }
    } catch (error: any) {
      console.error("Error:", error);
      setToast({ message: "Error submitting payment. Check console.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between pb-20">
      {/* 🔹 Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ← Back
          </Button>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center text-gray-800 dark:text-white">
                Add Money
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Wallet Dropdown */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Wallet
                  </label>
                  <select
                    value={selectedWallet}
                    onChange={handleWalletChange}
                    className="w-full border rounded-lg p-2 mt-1 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">-- Choose Wallet --</option>
                    {wallets.map((wallet, idx) => (
                      <option key={idx} value={wallet.wallet_name}>
                        {wallet.wallet_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wallet Address */}
                {walletAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wallet Address
                    </label>
                    <Input type="text" value={walletAddress} readOnly className="bg-gray-100 dark:bg-gray-700" />
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Payment Proof */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Payment Proof
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                {/* Submit Button */}
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
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center p-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
          </Link>
          <Link to="/add-money" className="flex flex-col items-center p-2">
            <Wallet className="w-6 h-6 text-blue-600" />
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

export default AddMoney;
