import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const ExchangeGiftCard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [giftcards, setGiftcards] = useState<any[]>([]);
  const [selectedGiftcard, setSelectedGiftcard] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [cardValue, setCardValue] = useState("");
  const [nairaValue, setNairaValue] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/php/get_giftcards.php")
      .then((res) => {
        if (res.data.success) setGiftcards(res.data.giftcards);
      })
      .catch((err) => console.error("❌ Error fetching giftcards:", err));
  }, []);

  // 🔹 Update exchange rate and compute Naira value
  const handleGiftcardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cardName = e.target.value;
    setSelectedGiftcard(cardName);

    const selected = giftcards.find((g: any) => g.giftcard_name === cardName);
    if (selected) {
      setExchangeRate(selected.exchange_rate);
      if (cardValue) {
        const value = parseFloat(cardValue) * selected.exchange_rate;
        setNairaValue(value.toFixed(2));
      }
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardValue(value);
    if (exchangeRate) {
      const naira = parseFloat(value) * parseFloat(exchangeRate);
      setNairaValue(naira.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setMessage("User not logged in");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("card_type", selectedGiftcard);
    formData.append("card_value", cardValue);
    formData.append("naira_value", nairaValue);
    formData.append("exchange_rate", exchangeRate);
    formData.append("bank_name", bankName);
    formData.append("account_name", accountName);
    formData.append("account_number", accountNumber);
    if (proofImage) formData.append("proof_image", proofImage);

    try {
      const res = await axios.post(
        "http://localhost/cosmic-view-frames-main/public/php/exchange_giftcard.php",
        formData
      );

      if (res.data.success) {
        setMessage("Gift card exchange request submitted successfully!");
        setShowSuccess(true);

        // Redirect after animation
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/transactions");
        }, 2500);
      } else {
        setMessage(res.data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setMessage("Error submitting request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative overflow-hidden">
      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <Button
          className="mb-4 bg-gray-600 hover:bg-gray-700 text-white"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">
              Exchange Gift Card to Naira
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
                  {giftcards.map((card: any) => (
                    <option key={card.id} value={card.giftcard_name}>
                      {card.giftcard_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exchange Rate */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exchange Rate
                </label>
                <input
                  type="text"
                  value={exchangeRate}
                  readOnly
                  className="w-full border rounded p-2 bg-black text-white"
                />
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
                  Naira Value
                </label>
                <input
                  type="text"
                  value={nairaValue}
                  readOnly
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              {/* Proof Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Proof
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProofImage(e.target.files ? e.target.files[0] : null)
                  }
                  required
                  className="w-full border rounded p-2 bg-black text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Exchange
              </Button>
            </form>

            {message && (
              <p className="text-center mt-4 text-sm text-blue-600">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>

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
                Gift card exchange submitted successfully.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExchangeGiftCard;
