import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  FaSearch, 
  FaPlus, 
  FaStar, 
  FaRegStar, 
  FaPlay, 
  FaStop,
  FaTrash,
  FaCopy
} from 'react-icons/fa';
import Button from '../common/Button';

/**
 * Komponent panelu bocznego
 */
const Sidebar = ({ 
  scenes, 
  selectedSceneId, 
  onSelectScene, 
  onAddScene, 
  onDeleteScene,
  startScene,
  onSetStartScene,
  onDuplicateScene
}) => {
  // Stan lokalny
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Filtrowanie scen na podstawie wyszukiwania
  const filteredScenes = Object.entries(scenes).filter(([id, scene]) => {
    const query = searchQuery.toLowerCase();
    return (
      id.toLowerCase().includes(query) ||
      scene.title.toLowerCase().includes(query) ||
      (scene.tags && scene.tags.toLowerCase().includes(query))
    );
  });
  
  // Sortowanie scen (najpierw scena startowa, potem alfabetycznie)
  const sortedScenes = filteredScenes.sort((a, b) => {
    // Scena startowa na początku
    if (a[0] === startScene) return -1;
    if (b[0] === startScene) return 1;
    
    // Reszta alfabetycznie po tytule
    return a[1].title.localeCompare(b[1].title);
  });
  
  // Obsługa potwierdzenia usunięcia
  const handleConfirmDelete = (sceneId) => {
    setConfirmDelete(sceneId);
  };
  
  // Obsługa usunięcia sceny
  const handleDeleteScene = (sceneId) => {
    onDeleteScene(sceneId);
    setConfirmDelete(null);
  };
  
  // Obsługa anulowania usunięcia
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  return (
    <div className="w-64 border-r min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="p-3 border-b dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold dark:text-white">Sceny</h2>
          <Button
            onClick={onAddScene}
            variant="primary"
            small
            icon={<FaPlus />}
            title="Dodaj nową scenę"
          />
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Szukaj scen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedScenes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Brak wyników wyszukiwania' : 'Brak zdefiniowanych scen'}
          </div>
        ) : (
          <ul className="divide-y dark:divide-gray-800">
            {sortedScenes.map(([id, scene]) => (
              <li key={id} className="relative">
                {confirmDelete === id ? (
                  <div className="p-3 bg-red-50 dark:bg-red-900">
                    <p className="text-sm text-red-700 mb-2 dark:text-red-300">
                      Czy na pewno chcesz usunąć scenę "{scene.title}"?
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        label="Anuluj"
                        onClick={handleCancelDelete}
                        variant="light"
                        small
                      />
                      <Button
                        label="Usuń"
                        onClick={() => handleDeleteScene(id)}
                        variant="danger"
                        small
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`
                      p-3 hover:bg-gray-100 cursor-pointer flex items-start
                      ${selectedSceneId === id ? 'bg-blue-50 dark:bg-blue-900' : ''} 
                      ${startScene === id ? 'bg-green-50 dark:bg-green-900' : ''}
                      dark:hover:bg-gray-800
                    `}
                    onClick={() => onSelectScene(id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate dark:text-white">
                        {scene.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate dark:text-gray-400">
                        ID: {id}
                      </div>
                      {scene.tags && (
                        <div className="text-xs text-gray-400 truncate mt-1 dark:text-gray-500">
                          {scene.tags}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetStartScene(id);
                        }}
                        className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${startScene === id ? 'text-yellow-500' : 'text-gray-400'}`}
                        title={startScene === id ? "Scena startowa" : "Ustaw jako scenę startową"}
                      >
                        {startScene === id ? <FaStar /> : <FaRegStar />}
                      </button>
                      
                      {onDuplicateScene && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateScene(id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 dark:hover:bg-gray-700"
                          title="Duplikuj scenę"
                        >
                          <FaCopy size={14} />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelete(id);
                        }}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 dark:hover:bg-gray-700"
                        title="Usuń scenę"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="p-3 border-t bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div>Wszystkich scen: {Object.keys(scenes).length}</div>
          {searchQuery && (
            <div>Wyników wyszukiwania: {filteredScenes.length}</div>
          )}
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  scenes: PropTypes.object.isRequired,
  selectedSceneId: PropTypes.string,
  onSelectScene: PropTypes.func.isRequired,
  onAddScene: PropTypes.func.isRequired,
  onDeleteScene: PropTypes.func.isRequired,
  startScene: PropTypes.string,
  onSetStartScene: PropTypes.func.isRequired,
  onDuplicateScene: PropTypes.func
};

export default Sidebar;