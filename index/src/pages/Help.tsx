import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, ArrowLeft, Home, Wallet, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-between pb-20">
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="w-full max-w-lg animate-fade-in">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
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

              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Need Help?
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Contact our support team below
              </p>
            </CardHeader>

            <CardContent className="space-y-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Mail className="w-6 h-6 text-blue-600" />
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  support@yourcompany.com
                </p>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <Phone className="w-6 h-6 text-blue-600" />
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  +1 (555) 123-4567
                </p>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  123 Business Avenue, Lagos, Nigeria
                </p>
              </div>

              <Button
                onClick={() => (window.location.href = "mailto:support@yourcompany.com")}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg mt-4"
              >
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🔹 Bottom Navigation */}
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
            <span className="text-2xl text-blue-600">❓</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-2">
            <User className="w-6 h-6 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
