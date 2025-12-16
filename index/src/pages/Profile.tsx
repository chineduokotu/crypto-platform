import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  User,
  FileText,
  HelpCircle,
  Moon,
  Shield,
  ArrowLeft,
  Home,
  Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [userEmail, setUserEmail] = useState<string>("");
  const userId = localStorage.getItem("userId");
  
  useEffect(() => {
    if (!userId) return;

    fetch("http://localhost/php/get_user_email.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setUserEmail(data.email);
      }
    })
    .catch(err => console.error(err));
  }, [userId]);

  const accountItems = [
    { icon: User, label: 'My Profile', to: '/my-profile' },
    { icon: FileText, label: 'History', to: '/transaction-history' },
    { icon: HelpCircle, label: 'Help & Support', to: '/help' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fullName = localStorage.getItem('fullName') || 'User';

  const referralLink = userEmail 
    ? `http://localhost:8080/register?ref=${userEmail}`
    : "Loading...";

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative pb-20">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4">

        {/* Profile Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {fullName
                    ? fullName
                        .split(" ")
                        .map(word => word[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : ""
                  }
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{fullName}</h2>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 px-2">Account</h3>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-0">
              {accountItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 px-2">Refer & Earn</h3>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <p className="text-sm mb-2 font-medium">Your Referral Link:</p>

              <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm outline-none select-all"
                />
                <button
                  onClick={copyReferral}
                  disabled={!userEmail}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Copy
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Share this link — users who register using it become your referrals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 px-2">Preference</h3>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Dark Mode</span>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Security */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 px-2">Privacy & Security</h3>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <CardContent className="p-0">
            <button
              onClick={handleLogout}
              className="w-full p-4 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-lg"
            >
              Logout
            </button>
          </CardContent>
        </Card>
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

export default Profile;
