import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Wallet,
  Clock,
  User,
} from "lucide-react"; // Icons for bottom nav

const TransactionHistory = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost/php/get_transactions.php?userId=${userId}`
        );
        console.log("✅ Server response:", res.data);
        if (res.data.success) {
          setTransactions(res.data.transactions);
        } else {
          console.error("❌ Backend error:", res.data.error);
        }
      } catch (error) {
        console.error("❌ Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto w-full">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Transaction History
            </CardTitle>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="sm:w-auto"
            >
              ← Back
            </Button>
          </CardHeader>

<CardContent className="p-0">
  {loading ? (
    <p className="text-center text-gray-500 dark:text-gray-400 py-6">
      Loading transactions...
    </p>
  ) : transactions.length === 0 ? (
    <p className="text-center text-gray-500 dark:text-gray-400 py-6">
      No transactions found.
    </p>
  ) : (
    <div
      style={{
        overflowX: "auto", // horizontal scroll if needed
        WebkitOverflowScrolling: "touch", // smooth scrolling on mobile
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: "600px", // ensures table has a minimum width
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f3f4f6", // light gray
              color: "#374151", // dark text
            }}
          >
            <th style={{ padding: "12px" }}>#</th>
            <th style={{ padding: "12px" }}>Wallet</th>
            <th style={{ padding: "12px" }}>Amount</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr
              key={tx.id}
              style={{
                borderBottom: "1px solid #60646dff",
                transition: "background-color 0.2s",
              }}
            >
              <td style={{ padding: "12px", whiteSpace: "nowrap" }}>{index + 1}</td>
              <td style={{ padding: "12px", whiteSpace: "nowrap" }}>{tx.wallet_name}</td>
              <td style={{ padding: "12px", whiteSpace: "nowrap", fontWeight: 500 }}>
                ₦{parseFloat(tx.amount).toLocaleString()}
              </td>
              <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor:
                      tx.status === "approved"
                        ? "#d1fae5"
                        : tx.status === "pending"
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      tx.status === "approved"
                        ? "#065f46"
                        : tx.status === "pending"
                        ? "#b45309"
                        : "#b91c1c",
                  }}
                >
                  {tx.status}
                </span>
              </td>
              <td style={{ padding: "12px", whiteSpace: "nowrap", color: "#6b7280" }}>
                {new Date(tx.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</CardContent>

        </Card>
      </div>

      {/* 🔹 Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around py-2 z-50">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          onClick={() => navigate("/wallet")}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs mt-1">Wallet</span>
        </button>

        <button
          onClick={() => navigate("/transactions")}
          className="flex flex-col items-center text-blue-600 dark:text-blue-400 transition"
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs mt-1 font-semibold">History</span>
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default TransactionHistory;
