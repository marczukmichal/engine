import React from 'react';
import PropTypes from 'prop-types';

/**
 * Komponent zakładek nawigacyjnych
 */
const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  variant = 'default',
  fullWidth = false
}) => {
  // Mapowanie wariantu na klasy CSS
  const variantClasses = {
    default: {
      container: 'border-b dark:border-gray-700',
      tab: {
        active: 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400',
        inactive: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }
    },
    boxed: {
      container: 'border-b dark:border-gray-700',
      tab: {
        active: 'bg-white border border-b-0 rounded-t-lg text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400',
        inactive: 'bg-gray-100 border border-transparent rounded-t-lg text-gray-500 hover:text-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
      }
    },
    pills: {
      container: '',
      tab: {
        active: 'bg-blue-600 text-white rounded-lg dark:bg-blue-700',
        inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
      }
    },
    minimal: {
      container: 'border-b dark:border-gray-800',
      tab: {
        active: 'text-blue-600 font-medium dark:text-blue-400',
        inactive: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      }
    }
  };
  
  // Pobierz klasy dla wybranego wariantu
  const containerClass = variantClasses[variant]?.container || variantClasses.default.container;
  const tabClasses = variantClasses[variant]?.tab || variantClasses.default.tab;
  
  return (
    <div className={`mb-4 ${containerClass}`}>
      <ul className={`flex ${fullWidth ? 'w-full' : ''}`}>
        {tabs.map((tab) => (
          <li 
            key={tab.id} 
            className={`
              ${fullWidth ? 'flex-1 text-center' : 'mr-4'} 
              ${activeTab === tab.id ? tabClasses.active : tabClasses.inactive}
              px-3 py-2 cursor-pointer transition-colors font-medium text-sm
            `}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && (
              <span className={`${tab.label ? 'mr-2' : ''} inline-block`}>
                {tab.icon}
              </span>
            )}
            {tab.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.element
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'boxed', 'pills', 'minimal']),
  fullWidth: PropTypes.bool
};

export default Tabs;