import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // ✅ animation import

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

const BuyGiftCard: React.FC = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [giftcards, setGiftcards] = useState<Giftcard[]>([]);
  const [selectedGiftcard, setSelectedGiftcard] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [cardValue, setCardValue] = useState<string>("");
  const [nairaValue, setNairaValue] = useState<string>("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // ✅ Auto-hide toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch all gift cards
  useEffect(() => {
    axios
      .get("http://localhost/php/get_giftcards.php")
      .then((res) => {
        if (res.data.success) setGiftcards(res.data.giftcards);
      })
      .catch((err) => console.error("❌ Error fetching giftcards:", err));
  }, []);

  // Fetch bank account details when a gift card is selected
  const handleGiftcardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cardName = e.target.value;
    setSelectedGiftcard(cardName);

    const selected = giftcards.find((g) => g.giftcard_name === cardName);
    if (selected) {
      setExchangeRate(selected.exchange_rate);
      if (cardValue) {
        const total = parseFloat(cardValue) * parseFloat(selected.exchange_rate);
        setNairaValue(total.toFixed(2));
      }

      // Fetch bank account details
      axios
        .get("http://localhost/cosmic-view-frames-main/public/php/get_accounts.php")
        .then((res) => {
          if (res.data.success) {
            setBankAccounts(res.data.accounts);
          } else {
            setBankAccounts([]);
          }
        })
        .catch((err) => console.error("❌ Error fetching account details:", err));
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardValue(value);

    if (exchangeRate) {
      const total = parseFloat(value) * parseFloat(exchangeRate);
      setNairaValue(total.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setToast({ text: "⚠️ User not logged in.", type: "error" });
      return;
    }

    if (!selectedGiftcard || !cardValue || !nairaValue) {
      setToast({ text: "⚠️ All fields are required.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("card_type", selectedGiftcard);
    formData.append("card_value", cardValue);
    formData.append("naira_value", nairaValue);
    formData.append("exchange_rate", exchangeRate);

    try {
      const res = await axios.post(
        "http://localhost/cosmic-view-frames-main/public/php/buy_giftcard.php",
        formData
      );

      if (res.data.success) {
        setToast({ text: "✅ Gift card purchased successfully!", type: "success" });
        setTimeout(() => navigate("/transactions"), 2000);
      } else {
        setToast({
          text: res.data.error || "❌ Something went wrong.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setToast({ text: "⚠️ Error submitting purchase.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
      {/* ✅ Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.text}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed top-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto">
        <Button
          type="button"
          className="w-full bg-gray-600 hover:bg-gray-700 text-white mb-4"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">
              Buy Gift Card
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Gift Card Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gift Card Type
                </label>
                <select
                  value={selectedGiftcard}
                  onChange={handleGiftcardChange}
                  required
                  className="w-full border rounded p-2 bg-black text-white"
                >
                  <option value="">-- Select Gift Card --</option>
                  {giftcards.map((card) => (
                    <option key={card.id} value={card.giftcard_name}>
                      {card.giftcard_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Card Value */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Card Value (USD)
                </label>
                <input
                  type="text"
                  value={cardValue}
                  onChange={handleValueChange}
                  required
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              {/* Naira Value */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Cost (NGN)
                </label>
                <input
                  type="text"
                  value={nairaValue}
                  readOnly
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              {/* Bank Account Details */}
              {bankAccounts.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-4">
                  <h3 className="font-semibold mb-2 text-center">Bank Account Details</h3>
                  {bankAccounts.map((acc) => (
                    <div key={acc.id} className="border-b border-gray-300 py-2 text-center">
                      <p>
                        <strong>{acc.bank_name}</strong>
                      </p>
                      <p>Account Name: {acc.account_name}</p>
                      <p>Account Number: {acc.account_number}</p>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-green-700 text-white mt-4"
              >
                Buy Gift Card
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyGiftCard;