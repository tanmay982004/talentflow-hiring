// src/components/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { 
  DocumentArrowUpIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  accept?: string; // e.g., ".pdf,.doc,.docx,.jpg,.png"
  maxSize?: number; // in MB
  multiple?: boolean;
  required?: boolean;
  onFilesChange: (files: File[]) => void;
  label?: string;
  error?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 10,
  multiple = false,
  required = false,
  onFilesChange,
  label = "Upload files",
  error
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const getFileIcon = (file: File) => {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return <PhotoIcon className="w-6 h-6" />;
    if (type.startsWith('video/')) return <FilmIcon className="w-6 h-6" />;
    if (type.startsWith('audio/')) return <MusicalNoteIcon className="w-6 h-6" />;
    if (extension === 'pdf') return <DocumentIcon className="w-6 h-6 text-red-500" />;
    if (['doc', 'docx'].includes(extension || '')) return <DocumentIcon className="w-6 h-6 text-blue-500" />;
    if (['xls', 'xlsx'].includes(extension || '')) return <DocumentIcon className="w-6 h-6 text-green-500" />;
    if (['ppt', 'pptx'].includes(extension || '')) return <DocumentIcon className="w-6 h-6 text-orange-500" />;
    
    return <DocumentIcon className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept) {
      const allowedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isValidType = allowedTypes.some(allowedType => {
        if (allowedType.startsWith('.')) {
          return fileExtension === allowedType.toLowerCase();
        }
        return mimeType === allowedType;
      });

      if (!isValidType) {
        return `File type not allowed. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const simulateUpload = (file: File, fileId: string) => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        );
      } else {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress }
              : f
          )
        );
      }
    }, 100);
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newUploadedFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

      if (validationError) {
        newUploadedFiles.push({
          file,
          id: fileId,
          status: 'error',
          progress: 0,
          error: validationError
        });
      } else {
        validFiles.push(file);
        newUploadedFiles.push({
          file,
          id: fileId,
          status: 'uploading',
          progress: 0
        });

        // Start simulated upload
        setTimeout(() => simulateUpload(file, fileId), 100);
      }
    });

    if (!multiple) {
      setUploadedFiles(newUploadedFiles);
      onFilesChange(validFiles);
    } else {
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      const allValidFiles = [...uploadedFiles.filter(f => f.status === 'success').map(f => f.file), ...validFiles];
      onFilesChange(allValidFiles);
    }
  }, [accept, maxSize, multiple, onFilesChange, uploadedFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      const validFiles = newFiles.filter(f => f.status === 'success').map(f => f.file);
      onFilesChange(validFiles);
      return newFiles;
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 ${
          dragActive 
            ? 'border-purple-500 bg-purple-50' 
            : error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept={accept}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            dragActive ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <DocumentArrowUpIcon className={`w-6 h-6 ${
              dragActive ? 'text-purple-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept && `Accepted types: ${accept}`}
              {maxSize && ` • Max size: ${maxSize}MB`}
              {multiple && ' • Multiple files allowed'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <ExclamationCircleIcon className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {multiple ? 'Uploaded Files' : 'Uploaded File'}
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(uploadedFile.file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'uploading' && (
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {uploadedFile.status === 'success' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    {uploadedFile.status === 'uploading' && (
                      <p className="text-xs text-purple-600">
                        {Math.round(uploadedFile.progress)}%
                      </p>
                    )}
                  </div>
                  
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-200"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;