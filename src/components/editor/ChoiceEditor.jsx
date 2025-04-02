import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import ConditionBuilder from './ConditionBuilder';
import ActionBuilder from './ActionBuilder';
import { 
  FaAngleUp, 
  FaAngleDown, 
  FaTrash, 
  FaCog, 
  FaCheck, 
  FaTimes 
} from 'react-icons/fa';

/**
 * Komponent edytora wyboru w scenie
 */
const ChoiceEditor = ({ 
  choice, 
  index, 
  allScenes, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown 
}) => {
  // Stan lokalny
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  // Obsługa zmiany tekstu wyboru
  const handleTextChange = (e) => {
    onUpdate({
      ...choice,
      text: e.target.value
    });
  };
  
  // Obsługa zmiany docelowej sceny
  const handleTargetSceneChange = (e) => {
    onUpdate({
      ...choice,
      nextScene: e.target.value
    });
  };
  
  // Obsługa aktualizacji warunku
  const handleConditionUpdate = (condition) => {
    onUpdate({
      ...choice,
      condition
    });
  };
  
  // Obsługa aktualizacji akcji
  const handleActionsUpdate = (actions) => {
    onUpdate({
      ...choice,
      actions
    });
  };
  
  // Usunięcie warunku
  const handleRemoveCondition = () => {
    onUpdate({
      ...choice,
      condition: null
    });
    setShowConditions(false);
  };
  
  return (
    <div className="border p-3 rounded bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">#{index + 1}</span>
            <input
              type="text"
              value={choice.text}
              onChange={handleTextChange}
              className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Tekst wyboru..."
            />
          </div>
          
          {!isExpanded && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {choice.nextScene ? (
                <span>→ Do sceny: {allScenes[choice.nextScene]?.title || choice.nextScene}</span>
              ) : (
                <span>Brak docelowej sceny</span>
              )}
              
              {choice.condition && (
                <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                  <FaCog className="inline mr-1" size={12} />
                  Z warunkiem
                </span>
              )}
              
              {choice.actions && choice.actions.length > 0 && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  <FaCheck className="inline mr-1" size={12} />
                  {choice.actions.length} akcji
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onMoveUp}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaAngleUp />
          </button>
          <button
            onClick={onMoveDown}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaAngleDown />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? <FaTimes /> : <FaCog />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pl-2 border-l-2 border-blue-300 space-y-3 dark:border-blue-700">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Przejdź do sceny:
            </label>
            <select
              value={choice.nextScene || ''}
              onChange={handleTargetSceneChange}
              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">-- Wybierz scenę --</option>
              {Object.entries(allScenes).map(([id, scene]) => (
                <option key={id} value={id}>
                  {scene.title} ({id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm dark:text-gray-300">Warunek wyświetlania:</h4>
              <div>
                {choice.condition ? (
                  <div className="flex space-x-2">
                    <Button
                      label="Edytuj"
                      onClick={() => setShowConditions(!showConditions)}
                      variant="secondary"
                      small
                    />
                    <Button
                      label="Usuń"
                      onClick={handleRemoveCondition}
                      variant="danger"
                      small
                    />
                  </div>
                ) : (
                  <Button
                    label="Dodaj warunek"
                    onClick={() => setShowConditions(true)}
                    variant="secondary"
                    small
                  />
                )}
              </div>
            </div>
            
            {showConditions && (
              <div className="p-3 bg-gray-50 rounded border dark:bg-gray-900 dark:border-gray-700">
                <ConditionBuilder
                  condition={choice.condition}
                  onUpdate={handleConditionUpdate}
                />
              </div>
            )}
            
            {!showConditions && choice.condition && (
              <div className="p-2 bg-yellow-50 text-sm rounded dark:bg-yellow-900 dark:text-yellow-100">
                <span>Ten wybór ma zdefiniowany warunek wyświetlania.</span>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm dark:text-gray-300">Akcje przy wyborze:</h4>
              <Button
                label={showActions ? "Ukryj akcje" : "Pokaż akcje"}
                onClick={() => setShowActions(!showActions)}
                variant="secondary"
                small
              />
            </div>
            
            {showActions && (
              <div className="p-3 bg-gray-50 rounded border dark:bg-gray-900 dark:border-gray-700">
                <ActionBuilder
                  actions={choice.actions || []}
                  onUpdate={handleActionsUpdate}
                  allScenes={allScenes}
                />
              </div>
            )}
            
            {!showActions && choice.actions && choice.actions.length > 0 && (
              <div className="p-2 bg-green-50 text-sm rounded dark:bg-green-900 dark:text-green-100">
                <span>Ten wybór ma zdefiniowane {choice.actions.length} akcje.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ChoiceEditor.propTypes = {
  choice: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string.isRequired,
    nextScene: PropTypes.string,
    condition: PropTypes.object,
    actions: PropTypes.array
  }).isRequired,
  index: PropTypes.number.isRequired,
  allScenes: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired
};

export default ChoiceEditor;