import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import KYC from "./pages/KYC";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile"; // <-- Import your MyProfile page
import ProtectedRoute from "./components/ProtectedRoute";
import Help from "./pages/Help";
import AddMoney from "./pages/add-money";
import TransactionHistory from "@/pages/TransactionHistory";
import BuyCrypto from "@/pages/BuyCrypto"; // adjust path if different
import ExchangeCrypto from "@/pages/ExchangeCrypto";
import ExchangeGiftCard from "./pages/ExchangeGiftCard";
import BuyGiftCard from "@/pages/BuyGiftCard";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* KYC Route (optional enforcement) */}
            <Route
              path="/kyc"
              element={
                <ProtectedRoute requireKYC={false}>
                  <KYC />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute requireKYC={false}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            <Route path="/transaction-history" element={<TransactionHistory />} />

            <Route
  path="/help"
  element={
    <ProtectedRoute>
      <Help />
    </ProtectedRoute>
  }
/>

<Route
  path="/add-money"
  element={
    <ProtectedRoute>
      <AddMoney />
    </ProtectedRoute>
  }
/>

<Route path="/buy-crypto" element={<BuyCrypto />} />
<Route path="/exchange-crypto" element={<ExchangeCrypto />} />
<Route path="/exchange-giftcard" element={<ExchangeGiftCard />} />
<Route path="/buy-giftcard" element={<BuyGiftCard />} />
<Route path="/notifications" element={<Notifications />} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
