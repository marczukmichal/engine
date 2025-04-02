import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

/**
 * Komponent powiadomień (toastów)
 */
const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  autoClose = true
}) => {
  // Stan animacji wyjścia
  const [isExiting, setIsExiting] = useState(false);
  
  // Mapowanie typów na klasy CSS i ikony
  const toastTypes = {
    success: {
      bg: 'bg-green-100 dark:bg-green-900',
      border: 'border-green-400 dark:border-green-700',
      text: 'text-green-700 dark:text-green-300',
      icon: <FaCheckCircle className="text-green-500 dark:text-green-400" />
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      border: 'border-blue-400 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      icon: <FaInfoCircle className="text-blue-500 dark:text-blue-400" />
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      border: 'border-yellow-400 dark:border-yellow-700',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: <FaExclamationTriangle className="text-yellow-500 dark:text-yellow-400" />
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900',
      border: 'border-red-400 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
      icon: <FaExclamationCircle className="text-red-500 dark:text-red-400" />
    }
  };
  
  // Pobierz style dla typu powiadomienia
  const toastStyle = toastTypes[type] || toastTypes.info;
  
  // Efekt automatycznego zamykania powiadomienia
  useEffect(() => {
    let timer;
    
    if (autoClose) {
      // Ustaw timer do rozpoczęcia animacji wyjścia przed końcem czasu trwania
      timer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 300); // 300ms na animację
      
      // Ustaw timer do zamknięcia powiadomienia po zakończeniu animacji
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [duration, onClose, autoClose]);
  
  // Obsługa zamknięcia przez użytkownika
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Czas trwania animacji wyjścia
  };
  
  return (
    <div 
      className={`
        ${toastStyle.bg} ${toastStyle.border} ${toastStyle.text}
        border rounded-lg shadow-lg p-4 max-w-md w-full flex items-start
        transition-all duration-300 transform
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {toastStyle.icon}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      <button
        className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
        onClick={handleClose}
      >
        <FaTimes />
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  autoClose: PropTypes.bool
};

export default Toast;