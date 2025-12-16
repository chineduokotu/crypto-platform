import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home, Wallet, User } from "lucide-react";

const MyProfile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch user details
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost/php/get_profile.php?userId=${userId}`
        );
        if (res.data.success) {
          setFormData({
            firstName: res.data.user.first_name,
            lastName: res.data.user.last_name,
            email: res.data.user.email,
            phoneNumber: res.data.user.phone_number || "",
            address: res.data.user.address || "",
            dateOfBirth: res.data.user.date_of_birth || "",
          });
        } else {
          alert(res.data.error || "Failed to fetch profile");
        }
      } catch (err: any) {
        console.error(err);
        alert("Error fetching profile. Check console.");
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost/cosmic-view-frames-main/public/php/update_profile.php",
        {
          userId,
          ...formData,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        alert("Profile updated successfully!");
        navigate("/profile");
      } else {
        alert(res.data.error || "Update failed");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating profile. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between p-4 pb-20">
      <div className="w-full max-w-lg mx-auto animate-fade-in">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="pb-4">
            {/* Back Button */}
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              My Profile
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="flex-1"
                  required
                />
                <Input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="flex-1"
                  required
                />
              </div>

              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <Input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              <Input
                name="dateOfBirth"
                type="date"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Bottom Navigation */}
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

export default MyProfile;
