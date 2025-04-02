import React from 'react';
import PropTypes from 'prop-types';

/**
 * Uniwersalny komponent przycisku
 */
const Button = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  type = 'button',
  size = 'medium',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  className = '',
  small = false, // Prostszy sposób na przełączanie między rozmiarem średnim a małym
  children
}) => {
  // Mapowanie wariantów na klasy CSS
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-700',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800 dark:border-green-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 dark:bg-red-700 dark:hover:bg-red-800 dark:border-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:border-yellow-600',
    info: 'bg-blue-400 hover:bg-blue-500 text-white border-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-500',
    light: 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700',
    link: 'bg-transparent hover:underline text-blue-600 border-transparent dark:text-blue-400'
  };
  
  // Mapowanie rozmiaru na klasy CSS
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-2'
  };
  
  // Użyj parametru small do przełączenia między medium a small
  const actualSize = small ? 'small' : size;
  
  // Ustaw klasy CSS na podstawie właściwości
  const buttonClasses = `
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[actualSize] || sizeClasses.medium}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    border rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors
    flex items-center justify-center
    ${className}
  `;
  
  // Renderuj ikony w zależności od ich pozycji
  const renderIcon = () => {
    if (!icon) return null;
    
    return React.cloneElement(icon, {
      className: `${iconPosition === 'left' ? 'mr-2' : 'ml-2'} ${small ? 'text-sm' : 'text-base'}`
    });
  };
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {iconPosition === 'left' && renderIcon()}
      {label || children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'light', 'link'
  ]),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.element,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  small: PropTypes.bool,
  children: PropTypes.node
};

export default Button;