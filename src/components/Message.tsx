"use client";

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface MessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({ type, message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${getStyles()}`}>
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 mr-4">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Message; 