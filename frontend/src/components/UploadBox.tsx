import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, CloudUpload, Shield, Loader2 } from 'lucide-react';
import { analyzeContract, AnalysisResponse } from '../api';

interface UploadBoxProps {
  onAnalysisComplete: (data: AnalysisResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({ 
  onAnalysisComplete, 
  isLoading, 
  setIsLoading 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        setSelectedFile(files[0]);
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (validateFile(files[0])) {
        setSelectedFile(files[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use mock API for demo - replace with analyzeContract for production
      const result = await analyzeContract(selectedFile);
      onAnalysisComplete(result);
    } catch (err) {
      setError('Failed to analyze contract. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    return selectedFile.type === 'application/pdf' ? '📄' : '📝';
  };

  return (
    <div className="legal-card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
          <CloudUpload className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Upload Contract
          </h2>
          <p className="text-sm text-muted-foreground">
            PDF or DOCX files up to 10MB
          </p>
        </div>
      </div>

      <div
        className={`upload-zone cursor-pointer ${isDragActive ? 'upload-zone-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          disabled={isLoading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
              isDragActive 
                ? 'bg-accent/20 scale-110' 
                : 'bg-muted'
            }`}>
              <Upload className={`w-8 h-8 transition-colors duration-300 ${
                isDragActive ? 'text-accent' : 'text-muted-foreground'
              }`} />
            </div>
            <p className="font-medium text-foreground mb-1">
              {isDragActive ? 'Drop your contract here' : 'Drag & drop your contract'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Supports PDF and DOCX formats</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getFileIcon()}</span>
              <div>
                <p className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="mt-6 w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 gradient-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Contract...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Analyze Contract</span>
            </>
          )}
        </button>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Your contract is never stored. Analysis is processed securely and deleted immediately.</span>
      </div>
    </div>
  );
};

export default UploadBox;
