import React from 'react';
import PropTypes from 'prop-types';
import { 
  FaBars, 
  FaSun, 
  FaMoon, 
  FaCog, 
  FaFileExport, 
  FaUndo, 
  FaRedo,
  FaPlay,
  FaQuestionCircle
} from 'react-icons/fa';
import Button from '../common/Button';

/**
 * Komponent nagłówka aplikacji
 */
const Header = ({ 
  title,
  onToggleSidebar,
  onSettings,
  onExport,
  onThemeToggle,
  isDarkMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onPreview
}) => {
  return (
    <header className="bg-white shadow-sm px-4 py-2 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Przełącz panel boczny"
        >
          <FaBars className="text-gray-600 dark:text-gray-300" />
        </button>
        
        <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white truncate">
          {title || 'Adventure Game Builder'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex space-x-2 mr-4">
          <Button
            onClick={onUndo}
            disabled={!canUndo}
            variant="light"
            small
            icon={<FaUndo />}
            title="Cofnij (Ctrl+Z)"
          />
          <Button
            onClick={onRedo}
            disabled={!canRedo}
            variant="light"
            small
            icon={<FaRedo />}
            title="Ponów (Ctrl+Y)"
          />
        </div>
        
        {onPreview && (
          <Button
            label="Podgląd"
            onClick={onPreview}
            variant="primary"
            small
            icon={<FaPlay />}
            className="hidden sm:flex"
          />
        )}
        
        <Button
          onClick={onExport}
          variant="light"
          small
          icon={<FaFileExport />}
          title="Eksportuj projekt"
        />
        
        <Button
          onClick={onSettings}
          variant="light"
          small
          icon={<FaCog />}
          title="Ustawienia"
        />
        
        <Button
          onClick={onThemeToggle}
          variant="light"
          small
          icon={isDarkMode ? <FaSun /> : <FaMoon />}
          title={isDarkMode ? "Tryb jasny" : "Tryb ciemny"}
        />
        
        <a
          href="/help"
          className="p-2 rounded hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
          title="Pomoc"
        >
          <FaQuestionCircle />
        </a>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  onToggleSidebar: PropTypes.func.isRequired,
  onSettings: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onThemeToggle: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool,
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  onPreview: PropTypes.func
};

export default Header;