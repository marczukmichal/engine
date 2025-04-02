import React from 'react';
import PropTypes from 'prop-types';
import { FaSave, FaGithub, FaQuestionCircle } from 'react-icons/fa';

/**
 * Komponent stopki aplikacji
 */
const Footer = ({ lastSaved, projectInfo }) => {
  // Formatowanie czasu ostatniego zapisu
  const formatLastSaved = (date) => {
    if (!date) return 'Nigdy';
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <footer className="bg-gray-100 border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
      <div>
        <span className="mr-4">{projectInfo}</span>
        <span className="flex items-center">
          <FaSave className="mr-1" />
          Ostatni zapis: {formatLastSaved(lastSaved)}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <a 
          href="/help" 
          className="flex items-center hover:text-gray-900 dark:hover:text-gray-300"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <FaQuestionCircle className="mr-1" />
          Pomoc
        </a>
        
        <a 
          href="https://github.com/yourusername/adventure-game-builder" 
          className="flex items-center hover:text-gray-900 dark:hover:text-gray-300"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <FaGithub className="mr-1" />
          GitHub
        </a>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  lastSaved: PropTypes.instanceOf(Date),
  projectInfo: PropTypes.string
};

export default Footer;