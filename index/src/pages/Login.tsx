import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost/php/login.php',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ Login Response:', response.data);

      if (response.data.success) {
        const { userId, fullName, kycCompleted } = response.data;

        // Save login info in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('kycCompleted', kycCompleted ? 'true' : 'false');

       if (!response.data.kycCompleted) {
  navigate('/kyc');
} else {
  navigate('/dashboard');
}

      } else {
        alert(response.data.error || 'Login failed.');
      }
    } catch (err: any) {
      console.error('❌ Login Error:', err.response?.data || err);
      alert('Login failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Sign in to your premium bills payment account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
