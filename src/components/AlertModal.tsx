import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface AlertModalProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface AlertContextType {
  showAlert: (alert: Omit<AlertModalProps, 'onClose'>) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alert, setAlert] = useState<AlertModalProps | null>(null);

  const showAlert = (alertData: Omit<AlertModalProps, 'onClose'>) => {
    setAlert({
      ...alertData,
      onClose: () => setAlert(null),
      showCloseButton: alertData.showCloseButton !== false,
      autoClose: alertData.autoClose !== false,
      autoCloseDelay: alertData.autoCloseDelay || 5000
    });

    // Auto close se habilitado
    if (alertData.autoClose !== false) {
      setTimeout(() => {
        setAlert(null);
      }, alertData.autoCloseDelay || 5000);
    }
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && <AlertModal {...alert} />}
    </AlertContext.Provider>
  );
};

const AlertModal: React.FC<AlertModalProps> = ({
  type,
  title,
  message,
  onClose,
  showCloseButton = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl border-2 max-w-md w-full transform transition-all duration-300 ${getBackgroundColor()}`}>
        {/* Header */}
        <div className="flex items-start p-6">
          <div className="flex-shrink-0 mr-4">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${getTitleColor()}`}>
              {title}
            </h3>
            <p className={`mt-2 text-sm ${getMessageColor()}`}>
              {message}
            </p>
          </div>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200 font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
