// src/components/FileUploadPreview.tsx
import React from 'react';
import { DocumentArrowUpIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FileUploadPreviewProps {
  fileTypes?: string;
  maxFileSize?: number;
  required?: boolean;
}

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ 
  fileTypes, 
  maxFileSize, 
  required = false 
}) => {
  const getFileTypeDisplay = (types?: string) => {
    if (!types) return 'All file types';
    
    const typeList = types.split(',').map(type => type.trim());
    if (typeList.length <= 3) {
      return typeList.join(', ');
    }
    
    return `${typeList.slice(0, 3).join(', ')} and ${typeList.length - 3} more`;
  };

  const getMaxSizeDisplay = (size?: number) => {
    if (!size) return 'No size limit';
    
    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} GB max`;
    }
    return `${size} MB max`;
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer group">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
          <DocumentArrowUpIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {getFileTypeDisplay(fileTypes)} • {getMaxSizeDisplay(maxFileSize)}
          </p>
        </div>
        
        {required && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <ExclamationCircleIcon className="w-3 h-3" />
            <span>Required</span>
          </div>
        )}
      </div>
      
      {}
      {fileTypes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Supported formats: {fileTypes}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadPreview;