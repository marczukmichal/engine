import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowRight, FaClock, FaHome } from 'react-icons/fa';

/**
 * Komponent śledzący ścieżkę gracza przez gry
 */
const PathTracker = ({ history, scenes }) => {
  // Formatowanie czasu
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Obliczanie czasu przejścia między scenami
  const getTimeSpent = (current, previous) => {
    if (!previous) return null;
    
    const timeSpent = current.timestamp - previous.timestamp;
    return Math.round(timeSpent / 1000); // Czas w sekundach
  };

  // Jeśli historia jest pusta
  if (!history || history.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        <p>Brak historii ścieżki gracza.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-3 dark:text-white">Ścieżka gracza</h3>
      
      <div className="flex flex-wrap items-center">
        {history.map((item, index) => {
          const isFirst = index === 0;
          const scene = scenes[item.sceneId] || { title: `Unknown (${item.sceneId})` };
          const timeSpent = getTimeSpent(item, history[index - 1]);
          
          return (
            <React.Fragment key={index}>
              {!isFirst && (
                <div className="flex items-center mx-2 text-gray-500 dark:text-gray-400">
                  <FaArrowRight />
                  {timeSpent && (
                    <span className="mx-2 text-xs bg-gray-100 px-1 py-0.5 rounded dark:bg-gray-700">
                      <FaClock className="inline mr-1" size={10} />
                      {timeSpent}s
                    </span>
                  )}
                </div>
              )}
              
              <div 
                className={`
                  m-1 p-2 rounded-lg border flex items-center 
                  ${isFirst ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}
                `}
              >
                {isFirst && <FaHome className="mr-2 text-green-600 dark:text-green-400" />}
                <div>
                  <div className="font-medium dark:text-white">{scene.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(item.timestamp)} | ID: {item.sceneId}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        <p>Całkowita liczba odwiedzonych scen: {history.length}</p>
        {history.length > 1 && (
          <p>
            Całkowity czas gry: {Math.round((history[history.length - 1].timestamp - history[0].timestamp) / 1000)} sekund
          </p>
        )}
      </div>
    </div>
  );
};

PathTracker.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      sceneId: PropTypes.string.isRequired,
      timestamp: PropTypes.number.isRequired
    })
  ).isRequired,
  scenes: PropTypes.object.isRequired
};

export default PathTracker;