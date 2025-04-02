import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

/**
 * Komponent modalu
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  size = 'medium',
  showCloseButton = true,
  closeOnOutsideClick = true,
  children 
}) => {
  // Referencja do kontenera modalu
  const modalRef = useRef(null);
  
  // Mapowanie rozmiaru na klasy CSS
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    fullscreen: 'max-w-full m-4'
  };
  
  // Efekt zamykania modalu po klawiszu Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    // Zablokuj scroll body gdy modal jest otwarty
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Obsługa kliknięcia na zewnątrz modalu
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Jeśli modal nie jest otwarty, nie renderuj nic
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl overflow-hidden w-full ${sizeClasses[size]} dark:bg-gray-800 dark:text-white`}
      >
        {/* Nagłówek modalu */}
        <div className="flex justify-between items-center border-b p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        {/* Zawartość modalu */}
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge', 'fullscreen']),
  showCloseButton: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  children: PropTypes.node
};

export default Modal;