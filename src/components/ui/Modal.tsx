import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {}
      <div className="flex min-h-full items-start justify-center p-4 pt-20 sm:pt-24">
        <div className="relative w-full max-w-md animate-slide-in-up">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl">
            {}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-gray-500">Ready to save</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {}
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;