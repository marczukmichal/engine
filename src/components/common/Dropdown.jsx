import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * Komponent rozwijanej listy (dropdown)
 */
const Dropdown = ({ 
  options, 
  selectedOption, 
  onChange, 
  placeholder = 'Wybierz opcję',
  label,
  disabled = false,
  error,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  className = ''
}) => {
  // Stan widoczności listy
  const [isOpen, setIsOpen] = useState(false);
  
  // Referencja do kontenera listy
  const dropdownRef = useRef(null);
  
  // Mapowanie wariantów na klasy CSS
  const variantClasses = {
    default: 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700',
    primary: 'border-blue-300 bg-blue-50 dark:bg-blue-900 dark:border-blue-700',
    outlined: 'border-gray-300 bg-transparent dark:border-gray-700',
    minimal: 'border-transparent bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
  };
  
  // Mapowanie rozmiaru na klasy CSS
  const sizeClasses = {
    small: 'text-xs p-1',
    medium: 'text-sm p-2',
    large: 'text-base p-3'
  };
  
  // Obsługa kliknięcia poza listą
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);
  
  // Obsługa wyboru opcji
  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };
  
  // Znalezienie aktualnie wybranej opcji na podstawie value
  const findSelectedOption = () => {
    if (!selectedOption) return null;
    
    return options.find(option => 
      typeof option === 'object' 
        ? option.value === selectedOption 
        : option === selectedOption
    );
  };
  
  // Pobranie tekstu do wyświetlenia
  const getDisplayText = () => {
    const selected = findSelectedOption();
    
    if (!selected) return placeholder;
    
    return typeof selected === 'object' ? selected.label : selected;
  };
  
  return (
    <div 
      className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <button
        type="button"
        className={`
          flex items-center justify-between w-full border rounded 
          ${variantClasses[variant] || variantClasses.default}
          ${sizeClasses[size] || sizeClasses.medium}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
          ${error ? 'border-red-500 dark:border-red-400' : ''}
          ${isOpen ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''}
          transition-colors dark:text-white
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
          {getDisplayText()}
        </span>
        <span className="ml-2">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          {options.length === 0 ? (
            <div className="p-2 text-gray-500 text-center dark:text-gray-400">
              Brak dostępnych opcji
            </div>
          ) : (
            options.map((option, index) => {
              const value = typeof option === 'object' ? option.value : option;
              const label = typeof option === 'object' ? option.label : option;
              const isSelected = selectedOption === value;
              
              return (
                <div
                  key={index}
                  className={`
                    p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isSelected ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'dark:text-white'}
                  `}
                  onClick={() => handleSelect(value)}
                >
                  {label}
                </div>
              );
            })
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired
      })
    ])
  ).isRequired,
  selectedOption: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'outlined', 'minimal']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string
};

export default Dropdown;