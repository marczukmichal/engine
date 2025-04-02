import React from 'react';
import PropTypes from 'prop-types';

/**
 * Komponent głównej zawartości aplikacji
 */
const MainContent = ({ children }) => {
  return (
    <main className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </main>
  );
};

MainContent.propTypes = {
  children: PropTypes.node.isRequired
};

export default MainContent;