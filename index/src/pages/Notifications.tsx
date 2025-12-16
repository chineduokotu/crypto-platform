import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Home, Wallet, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  title: string;
  message_body: string;
  status: string;
  created_at: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost/php/get_notifications.php?userId=${userId}`
        );
        if (res.data.success) {
          setNotifications(res.data.notifications);
        } else {
          console.error("❌ Backend error:", res.data.error);
        }
      } catch (error) {
        console.error("❌ Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 p-4 md:p-6">

        
      <div className="max-w-4xl mx-auto w-full">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Notifications
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
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No notifications found.
              </p>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white text-base">
                          {note.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {note.message_body}
                        </p>
                      </div>
                     
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
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
          onClick={() => navigate("/notifications")}
          className="flex flex-col items-center text-blue-600 dark:text-blue-400 transition"
        >
          <Bell className="w-6 h-6" />
          <span className="text-xs mt-1 font-semibold">Notifications</span>
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

export default Notifications;
