import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaChevronDown, FaChevronRight, FaFlag, FaCalculator, FaBoxOpen, FaHistory, FaEdit } from 'react-icons/fa';

/**
 * Komponent do inspekcji stanu gry
 */
const StateInspector = ({ gameState }) => {
  // Stan lokalny do śledzenia rozwinięcia sekcji
  const [expandedSections, setExpandedSections] = useState({
    currentScene: true,
    inventory: true,
    flags: true,
    counters: true,
    history: false
  });
  
  // Edycja wartości (nie zaimplementowana pełna funkcjonalność)
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  
  // Przełączanie rozwinięcia sekcji
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Rozpoczęcie edycji wartości
  const startEditing = (type, key, value) => {
    setIsEditing(true);
    setEditingType(type);
    setEditingKey(key);
    setEditingValue(value);
  };
  
  // Zakończenie edycji wartości
  const finishEditing = () => {
    // Tu powinna być logika aktualizacji stanu gry
    setIsEditing(false);
    setEditingType(null);
    setEditingKey(null);
    setEditingValue(null);
  };
  
  // Renderowanie rozwijanych sekcji
  const renderCollapsibleSection = (title, content, section, icon) => {
    return (
      <div className="mb-3 border rounded overflow-hidden dark:border-gray-700">
        <div 
          className="bg-gray-100 p-2 flex items-center cursor-pointer hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => toggleSection(section)}
        >
          {expandedSections[section] ? <FaChevronDown className="mr-2" /> : <FaChevronRight className="mr-2" />}
          {icon && <span className="mr-2">{icon}</span>}
          <span className="font-medium dark:text-white">{title}</span>
        </div>
        
        {expandedSections[section] && (
          <div className="p-3 bg-white dark:bg-gray-900">{content}</div>
        )}
      </div>
    );
  };
  
  // Renderowanie aktualnej sceny
  const renderCurrentScene = () => {
    if (!gameState.currentScene) {
      return <div className="text-gray-500 dark:text-gray-400">Brak aktualnej sceny</div>;
    }
    
    return (
      <div className="bg-blue-50 p-2 rounded dark:bg-blue-900 dark:text-blue-100">
        {gameState.currentScene}
      </div>
    );
  };
  
  // Renderowanie ekwipunku
  const renderInventory = () => {
    const inventory = gameState.inventory || [];
    
    if (inventory.length === 0) {
      return <div className="text-gray-500 dark:text-gray-400">Ekwipunek jest pusty</div>;
    }
    
    return (
      <div className="space-y-1">
        {inventory.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800">
            <span className="dark:text-gray-300">{item.id}</span>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
              <button 
                className="ml-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                onClick={() => startEditing('inventory', item.id, item.quantity)}
              >
                <FaEdit size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderowanie flag
  const renderFlags = () => {
    const flags = gameState.flags || {};
    const flagEntries = Object.entries(flags);
    
    if (flagEntries.length === 0) {
      return <div className="text-gray-500 dark:text-gray-400">Brak ustawionych flag</div>;
    }
    
    return (
      <div className="space-y-1">
        {flagEntries.map(([key, value], index) => (
          <div key={index} className="flex justify-between items-center p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800">
            <span className="dark:text-gray-300">{key}</span>
            <div className="flex items-center">
              <span className={`
                ${typeof value === 'boolean' && value ? 'text-green-600 dark:text-green-400' : ''}
                ${typeof value === 'boolean' && !value ? 'text-red-600 dark:text-red-400' : ''}
                ${typeof value !== 'boolean' ? 'text-gray-600 dark:text-gray-400' : ''}
              `}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
              <button 
                className="ml-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                onClick={() => startEditing('flags', key, value)}
              >
                <FaEdit size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderowanie liczników
  const renderCounters = () => {
    const counters = gameState.counters || {};
    const counterEntries = Object.entries(counters);
    
    if (counterEntries.length === 0) {
      return <div className="text-gray-500 dark:text-gray-400">Brak aktywnych liczników</div>;
    }
    
    return (
      <div className="space-y-1">
        {counterEntries.map(([key, value], index) => (
          <div key={index} className="flex justify-between items-center p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800">
            <span className="dark:text-gray-300">{key}</span>
            <div className="flex items-center">
              <span className="text-purple-600 dark:text-purple-400">{value}</span>
              <button 
                className="ml-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                onClick={() => startEditing('counters', key, value)}
              >
                <FaEdit size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderowanie historii
  const renderHistory = () => {
    const history = gameState.history || [];
    
    if (history.length === 0) {
      return <div className="text-gray-500 dark:text-gray-400">Historia jest pusta</div>;
    }
    
    return (
      <div className="space-y-1 text-sm">
        {history.map((sceneId, index) => (
          <div key={index} className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800">
            <span className="dark:text-gray-300">{index + 1}. {sceneId}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Renderowanie edytora wartości
  const renderValueEditor = () => {
    if (!isEditing) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
        <div className="bg-white p-4 rounded shadow-lg max-w-md w-full dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-3 dark:text-white">
            Edycja wartości: {editingKey}
          </h3>
          
          <div className="mb-4">
            {typeof editingValue === 'boolean' ? (
              <select 
                value={editingValue.toString()} 
                onChange={(e) => setEditingValue(e.target.value === 'true')}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : typeof editingValue === 'number' ? (
              <input 
                type="number" 
                value={editingValue}
                onChange={(e) => setEditingValue(Number(e.target.value))}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            ) : (
              <input 
                type="text" 
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Anuluj
            </button>
            <button
              onClick={finishEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="border rounded bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="bg-blue-600 text-white p-3 dark:bg-blue-800">
        <h3 className="font-medium">Inspektor stanu gry</h3>
      </div>
      <div className="p-3">
        {renderCollapsibleSection(
          'Aktualna scena', 
          renderCurrentScene(), 
          'currentScene',
          <FaFlag />
        )}
        
        {renderCollapsibleSection(
          'Ekwipunek', 
          renderInventory(), 
          'inventory',
          <FaBoxOpen />
        )}
        
        {renderCollapsibleSection(
          'Flagi', 
          renderFlags(), 
          'flags',
          <FaFlag />
        )}
        
        {renderCollapsibleSection(
          'Liczniki', 
          renderCounters(), 
          'counters',
          <FaCalculator />
        )}
        
        {renderCollapsibleSection(
          'Historia', 
          renderHistory(), 
          'history',
          <FaHistory />
        )}
      </div>
      
      {renderValueEditor()}
    </div>
  );
};

StateInspector.propTypes = {
  gameState: PropTypes.object.isRequired
};

export default StateInspector;