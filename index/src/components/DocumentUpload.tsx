
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentUploadProps {
  documentType: string;
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onFileRemove: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  onFileUpload,
  uploadedFile,
  onFileRemove
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid file (JPG, PNG, or PDF)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    onFileUpload(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Upload {documentType}</h3>
      
      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-all cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your {documentType} here
            </p>
            <p className="text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: JPG, PNG, PDF (Max 5MB)
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" onClick={onFileRemove}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default DocumentUpload;
