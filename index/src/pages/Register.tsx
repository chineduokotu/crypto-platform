import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/ThemeToggle';
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referral: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get referral from URL query string if exists
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referral: ref }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.fullName &&
      formData.email &&
      formData.password &&
      formData.password === formData.confirmPassword
    ) {
      try {
        const response = await axios.post(
          "http://localhost/php/register.php",
          formData, // includes referral automatically
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ Registered:", response.data);

        if (response.data.success) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("fullName", formData.fullName);
          localStorage.setItem("userId", response.data.userId);

          navigate("/kyc");
        }
      } catch (error: any) {
        console.error("❌ Registration failed:", error.response?.data || error);
        alert("Registration failed. Check console for details.");
      }
    } else {
      alert("Please fill all fields and confirm your password.");
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
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Join our premium bills payment platform
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleInputChange}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Hidden Referral Input */}
              <input
                type="hidden"
                name="referral"
                value={formData.referral}
              />

              {/* Terms */}
              <div className="flex items-center space-x-2 text-sm">
                <input type="checkbox" className="rounded" required />
                <span className="text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
