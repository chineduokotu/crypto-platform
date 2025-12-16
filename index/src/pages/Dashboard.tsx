import React, { useEffect, useState } from 'react';
import {
  Bell, Eye, History, Home, Plus, Settings, User, Wallet,
  Zap, Wifi, Tv, Gift, Smartphone, CreditCard, Bus,
  Ticket, ShoppingBag, Plane, GraduationCap, Bot, Bitcoin, Coins, Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');
  const fullName = localStorage.getItem('fullName') || 'User';

  // ✅ Define all services but make only the selected 4 available
  const services = [
    // ✅ Available services (first four)
    { id: 'exchange-crypto', name: 'Exchange Crypto to Naira', icon: Bitcoin, color: 'from-yellow-500 to-orange-500', available: true },
    { id: 'exchange-giftcard', name: 'Exchange Gift Cards to Naira', icon: CreditCard, color: 'from-blue-500 to-teal-500', available: true },
    { id: 'buy-crypto', name: 'Buy Cryptocurrency', icon: Coins, color: 'from-green-500 to-emerald-500', available: true },
    { id: 'buy-giftcard', name: 'Buy Gift Cards', icon: Gift, color: 'from-pink-500 to-red-500', available: true },

    // ❌ Unavailable services
    { id: 'airtime', name: 'Airtime', icon: Smartphone, color: 'from-purple-500 to-pink-500', available: false },
    { id: 'data', name: 'Data', icon: Wifi, color: 'from-blue-500 to-purple-500', available: false },
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'from-orange-500 to-red-500', available: false },
    { id: 'tv', name: 'TV Subscription', icon: Tv, color: 'from-green-500 to-blue-500', available: false },
    { id: 'internet', name: 'Internet', icon: Wifi, color: 'from-cyan-500 to-blue-500', available: false },
    //{ id: 'gift', name: 'Gift User', icon: Gift, color: 'from-pink-500 to-purple-500', available: false },
    //{ id: 'esim', name: 'E-Sim', icon: CreditCard, color: 'from-indigo-500 to-purple-500', available: false },
   // { id: 'transport', name: 'Transport', icon: Bus, color: 'from-yellow-500 to-orange-500', available: false },
    //{ id: 'ticket', name: 'Ticket', icon: Ticket, color: 'from-red-500 to-yellow-500', available: false },
    //{ id: 'store', name: 'Store', icon: ShoppingBag, color: 'from-green-500 to-yellow-500', available: false },
    //{ id: 'redeem', name: 'Redeem Voucher', icon: Gift, color: 'from-blue-500 to-green-500', available: false },
    //{ id: 'virtualcard', name: 'Virtual Card', icon: CreditCard, color: 'from-purple-500 to-blue-500', available: false },
    //{ id: 'flight', name: 'Flight', icon: Plane, color: 'from-cyan-500 to-indigo-500', available: false },
    //{ id: 'education', name: 'Education', icon: GraduationCap, color: 'from-orange-500 to-pink-500', available: false },
    //{ id: 'alexai', name: 'Alex AI Assistant', icon: Bot, color: 'from-gray-500 to-blue-500', available: false },
  ];

  // 🔹 Fetch balance from PHP
  useEffect(() => {
    if (!userId) return;

    const fetchBalance = async () => {
      try {
        const response = await axios.get(
          `http://localhost/php/get_balance.php?userId=${userId}`
        );

        if (response.data.success) {
          setBalance(parseFloat(response.data.balance));
        } else {
          console.error(response.data.error || "Failed to fetch balance");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {fullName.substring(0, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome</p>
              <p className="font-semibold">{fullName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
<Bell
  onClick={() => navigate("/notifications")}
  className="w-6 h-6 text-muted-foreground cursor-pointer"
/>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-700 border-0 text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {loading ? (
                  <span className="text-xl animate-pulse">Fetching balance...</span>
                ) : (
                  <span className="text-2xl font-bold">
                    ₦{balance !== null ? balance.toLocaleString() : '0.00'}
                  </span>
                )}
                <Eye className="w-5 h-5 text-white/70" />
              </div>
              <Button
                onClick={() => navigate("/transaction-history")}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>

            <Button
              onClick={() => navigate('/add-money')}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Money
            </Button>

            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                onClick={() => service.available && navigate(`/${service.id}`)}
                className={`border-0 shadow-lg transition-all duration-300 hover:scale-105 ${
                  service.available
                    ? "bg-white/80 dark:bg-gray-800/80 cursor-pointer hover:shadow-xl"
                    : "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
                }`}
              >
                <CardContent className="p-4 text-center relative">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      !service.available ? "grayscale" : ""
                    }`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-foreground flex items-center justify-center gap-1">
                    {service.name}
                    {!service.available && <Lock className="w-4 h-4 text-gray-400" />}
                  </p>
                  {!service.available && (
                    <span className="absolute top-2 right-2 text-[10px] text-gray-400">
                      Unavailable
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <br /><br /><br />

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

export default Dashboard;
