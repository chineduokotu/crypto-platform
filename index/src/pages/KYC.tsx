import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, FileText, CreditCard, User, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import DocumentUpload from '@/components/DocumentUpload';

const KYC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: ''
  });

  const documentTypes = [
    { id: 'nin', name: 'National ID (NIN)', icon: User, description: 'Nigerian National Identification Number' },
    { id: 'drivers', name: "Driver's License", icon: CreditCard, description: "Valid driver's license" },
    { id: 'passport', name: 'International Passport', icon: FileText, description: 'Nigerian international passport' }
  ];

  const handleDocumentTypeSelect = (type: string) => {
    setSelectedDocumentType(type);
    setCurrentStep(2);
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File) => setUploadedFile(file);
  const handleFileRemove = () => setUploadedFile(null);

  const handleSubmitKYC = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("User not identified!");
    return;
  }

  const formDataToSend = new FormData();
  formDataToSend.append("userId", userId);
  formDataToSend.append("firstName", personalInfo.firstName);
  formDataToSend.append("lastName", personalInfo.lastName);
  formDataToSend.append("phoneNumber", personalInfo.phoneNumber);
  formDataToSend.append("address", personalInfo.address);
  formDataToSend.append("dateOfBirth", personalInfo.dateOfBirth);

  if (uploadedFile) {
    formDataToSend.append("documentFile", uploadedFile);
    formDataToSend.append("documentType", selectedDocumentType);
  }

  try {
    const response = await axios.post(
      "http://localhost/php/kyc.php",
      formDataToSend,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.success) {
      setCurrentStep(4);
      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      // Send PHP error to console
      console.error("KYC Error:", response.data.error || response.data);
    }
  } catch (err: any) {
    // Send Axios/network errors to console
    console.error("KYC Submission Failed:", err.response?.data || err);
  }
};


  const canProceedToNext = () => {
    if (currentStep === 2) {
      return personalInfo.firstName && personalInfo.lastName && personalInfo.phoneNumber && personalInfo.address && personalInfo.dateOfBirth;
    }
    if (currentStep === 3) return uploadedFile;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4">
        <button
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/register')}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verify Your Identity
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Complete your KYC verification to access all features
              </p>

              <div className="flex items-center justify-center space-x-2 mt-6">
                {[1, 2, 3].map(step => (
                  <div key={step} className={`w-3 h-3 rounded-full transition-colors ${step <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Step 1: Document Type */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Choose Document Type</h3>
                  <div className="grid gap-4">
                    {documentTypes.map(docType => {
                      const IconComponent = docType.icon;
                      return (
                        <Card
                          key={docType.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-102 border-2 hover:border-blue-500"
                          onClick={() => handleDocumentTypeSelect(docType.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{docType.name}</h4>
                                <p className="text-sm text-muted-foreground">{docType.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="First Name" value={personalInfo.firstName} onChange={val => handlePersonalInfoChange('firstName', val)} />
                    <InputField label="Last Name" value={personalInfo.lastName} onChange={val => handlePersonalInfoChange('lastName', val)} />
                    <InputField label="Phone Number" value={personalInfo.phoneNumber} onChange={val => handlePersonalInfoChange('phoneNumber', val)} />
                    <InputField label="Date of Birth" type="date" value={personalInfo.dateOfBirth} onChange={val => handlePersonalInfoChange('dateOfBirth', val)} />
                    <InputField label="Address" value={personalInfo.address} onChange={val => handlePersonalInfoChange('address', val)} fullWidth />
                  </div>
                  <Button onClick={() => setCurrentStep(3)} disabled={!canProceedToNext()} className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    Continue to Document Upload
                  </Button>
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <DocumentUpload
                    documentType={documentTypes.find(d => d.id === selectedDocumentType)?.name || ''}
                    onFileUpload={handleFileUpload}
                    uploadedFile={uploadedFile}
                    onFileRemove={handleFileRemove}
                  />
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1 h-12">Back</Button>
                    <Button onClick={handleSubmitKYC} disabled={!canProceedToNext()} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Submit KYC
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">KYC Submitted Successfully!</h3>
                    <p className="text-muted-foreground">
                      Your documents are being reviewed. You'll be notified once verification is complete.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Small helper component for inputs
const InputField = ({ label, type = "text", value, onChange, fullWidth }: any) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="h-12 bg-gray-50 dark:bg-gray-700 border-0" />
  </div>
);

export default KYC;
