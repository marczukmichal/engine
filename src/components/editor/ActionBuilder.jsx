import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

/**
 * Komponent budowniczego akcji
 */
const ActionBuilder = ({ actions, onUpdate, allScenes }) => {
  // Typy dostępnych akcji
  const actionTypes = [
    { id: 'ADD_ITEM', label: 'Dodaj przedmiot' },
    { id: 'REMOVE_ITEM', label: 'Usuń przedmiot' },
    { id: 'SET_FLAG', label: 'Ustaw flagę' },
    { id: 'TOGGLE_FLAG', label: 'Przełącz flagę' },
    { id: 'SET_COUNTER', label: 'Ustaw licznik' },
    { id: 'INCREMENT_COUNTER', label: 'Zwiększ licznik' },
    { id: 'GO_TO_SCENE', label: 'Przejdź do sceny' },
    { id: 'PLAY_AUDIO', label: 'Odtwórz dźwięk' },
    { id: 'STOP_AUDIO', label: 'Zatrzymaj dźwięk' },
    { id: 'SEQUENCE', label: 'Sekwencja akcji' },
    { id: 'CONDITIONAL', label: 'Akcja warunkowa' },
    { id: 'DELAYED', label: 'Akcja opóźniona' },
    { id: 'SET_ATTRIBUTE', label: 'Ustaw atrybut' },
    { id: 'MODIFY_ATTRIBUTE', label: 'Modyfikuj atrybut' }
  ];
  
  // Stan dla nowej akcji
  const [newActionType, setNewActionType] = useState('ADD_ITEM');
  
  // Tworzenie nowej akcji na podstawie typu
  const createNewAction = (type) => {
    switch (type) {
      case 'ADD_ITEM':
        return { type, itemId: '', quantity: 1 };
      case 'REMOVE_ITEM':
        return { type, itemId: '', quantity: 1 };
      case 'SET_FLAG':
        return { type, flagName: '', value: true };
      case 'TOGGLE_FLAG':
        return { type, flagName: '' };
      case 'SET_COUNTER':
        return { type, counterName: '', value: 0 };
      case 'INCREMENT_COUNTER':
        return { type, counterName: '', increment: 1 };
      case 'GO_TO_SCENE':
        return { type, sceneId: '' };
      case 'PLAY_AUDIO':
        return { type, audioId: '', volume: 1, loop: false };
      case 'STOP_AUDIO':
        return { type, audioId: '' };
      case 'SEQUENCE':
        return { type, actions: [] };
      case 'CONDITIONAL':
        return { type, condition: null, thenActions: [], elseActions: [] };
      case 'DELAYED':
        return { type, action: null, delay: 1000 };
      case 'SET_ATTRIBUTE':
        return { type, attributeName: '', value: 0 };
      case 'MODIFY_ATTRIBUTE':
        return { type, attributeName: '', delta: 0 };
      default:
        return { type: 'ADD_ITEM', itemId: '', quantity: 1 };
    }
  };
  
  // Dodawanie nowej akcji
  const handleAddAction = () => {
    onUpdate([...actions, createNewAction(newActionType)]);
  };
  
  // Aktualizacja istniejącej akcji
  const handleUpdateAction = (index, updatedAction) => {
    const updatedActions = [...actions];
    updatedActions[index] = updatedAction;
    onUpdate(updatedActions);
  };
  
  // Usuwanie akcji
  const handleRemoveAction = (index) => {
    const updatedActions = [...actions];
    updatedActions.splice(index, 1);
    onUpdate(updatedActions);
  };
  
  // Zmiana kolejności akcji
  const handleMoveAction = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === actions.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedActions = [...actions];
    
    [updatedActions[index], updatedActions[newIndex]] = 
      [updatedActions[newIndex], updatedActions[index]];
    
    onUpdate(updatedActions);
  };
  
  // Renderowanie formularza dla konkretnej akcji
  const renderActionForm = (action, index) => {
    switch (action.type) {
      case 'ADD_ITEM':
      case 'REMOVE_ITEM':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                ID przedmiotu:
              </label>
              <input
                type="text"
                value={action.itemId || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, itemId: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. klucz_do_piwnicy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Ilość:
              </label>
              <input
                type="number"
                value={action.quantity || 1}
                onChange={(e) => handleUpdateAction(index, { ...action, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'SET_FLAG':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa flagi:
              </label>
              <input
                type="text"
                value={action.flagName || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, flagName: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. spotkany_npc_jan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wartość:
              </label>
              <div className="flex items-center">
                <select
                  value={typeof action.value}
                  onChange={(e) => {
                    const type = e.target.value;
                    let newValue;
                    
                    switch (type) {
                      case 'boolean':
                        newValue = true;
                        break;
                      case 'number':
                        newValue = 0;
                        break;
                      case 'string':
                        newValue = '';
                        break;
                      default:
                        newValue = true;
                    }
                    
                    handleUpdateAction(index, { ...action, value: newValue });
                  }}
                  className="px-2 py-1 border rounded mr-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="boolean">Boolean</option>
                  <option value="number">Liczba</option>
                  <option value="string">Tekst</option>
                </select>
                
                {typeof action.value === 'boolean' ? (
                  <select
                    value={action.value.toString()}
                    onChange={(e) => handleUpdateAction(index, { ...action, value: e.target.value === 'true' })}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="true">Prawda</option>
                    <option value="false">Fałsz</option>
                  </select>
                ) : typeof action.value === 'number' ? (
                  <input
                    type="number"
                    value={action.value}
                    onChange={(e) => handleUpdateAction(index, { ...action, value: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={action.value || ''}
                    onChange={(e) => handleUpdateAction(index, { ...action, value: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>
        );
        
      case 'TOGGLE_FLAG':
        return (
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Nazwa flagi:
            </label>
            <input
              type="text"
              value={action.flagName || ''}
              onChange={(e) => handleUpdateAction(index, { ...action, flagName: e.target.value })}
              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="np. lampa_wlaczona"
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Przełącza wartość flagi między true i false
            </p>
          </div>
        );
        
      case 'SET_COUNTER':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa licznika:
              </label>
              <input
                type="text"
                value={action.counterName || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, counterName: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. liczba_prob"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wartość:
              </label>
              <input
                type="number"
                value={action.value || 0}
                onChange={(e) => handleUpdateAction(index, { ...action, value: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'INCREMENT_COUNTER':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa licznika:
              </label>
              <input
                type="text"
                value={action.counterName || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, counterName: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. liczba_prob"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Zwiększ o:
              </label>
              <input
                type="number"
                value={action.increment || 1}
                onChange={(e) => handleUpdateAction(index, { ...action, increment: parseInt(e.target.value) || 1 })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Możesz użyć wartości ujemnej, aby zmniejszyć licznik
              </p>
            </div>
          </div>
        );
        
      case 'GO_TO_SCENE':
        return (
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Przejdź do sceny:
            </label>
            <select
              value={action.sceneId || ''}
              onChange={(e) => handleUpdateAction(index, { ...action, sceneId: e.target.value })}
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
        );
        
      case 'PLAY_AUDIO':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                ID dźwięku:
              </label>
              <input
                type="text"
                value={action.audioId || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, audioId: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. door_open"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Głośność (0-1):
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={action.volume || 1}
                onChange={(e) => handleUpdateAction(index, { ...action, volume: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-right text-sm">{action.volume || 1}</div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`loop-${index}`}
                checked={action.loop || false}
                onChange={(e) => handleUpdateAction(index, { ...action, loop: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor={`loop-${index}`} className="text-sm dark:text-gray-300">
                Zapętlij dźwięk
              </label>
            </div>
          </div>
        );
        
      case 'STOP_AUDIO':
        return (
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              ID dźwięku:
            </label>
            <input
              type="text"
              value={action.audioId || ''}
              onChange={(e) => handleUpdateAction(index, { ...action, audioId: e.target.value })}
              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="np. background_music"
            />
          </div>
        );
        
      case 'SET_ATTRIBUTE':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa atrybutu:
              </label>
              <input
                type="text"
                value={action.attributeName || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, attributeName: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. sila, zrecznosc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wartość:
              </label>
              <input
                type="number"
                value={action.value || 0}
                onChange={(e) => handleUpdateAction(index, { ...action, value: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'MODIFY_ATTRIBUTE':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa atrybutu:
              </label>
              <input
                type="text"
                value={action.attributeName || ''}
                onChange={(e) => handleUpdateAction(index, { ...action, attributeName: e.target.value })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. sila, zrecznosc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Zmiana:
              </label>
              <input
                type="number"
                value={action.delta || 0}
                onChange={(e) => handleUpdateAction(index, { ...action, delta: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Wartość dodatnia zwiększa, ujemna zmniejsza
              </p>
            </div>
          </div>
        );
      
      // Dla bardziej złożonych akcji jak SEQUENCE, CONDITIONAL i DELAYED
      // moglibyśmy zaimplementować zagnieżdżone edytory, ale dla uproszczenia
      // dodajemy tylko podstawowe informacje
        
      case 'SEQUENCE':
        return (
          <div className="bg-yellow-50 p-2 rounded text-sm dark:bg-yellow-900 dark:text-yellow-100">
            <p>
              Sekwencja akcji - złożona akcja zawierająca wiele innych akcji.
              Implementacja pełnego edytora sekwencji wykracza poza zakres tego przykładu.
            </p>
          </div>
        );
        
      case 'CONDITIONAL':
        return (
          <div className="bg-yellow-50 p-2 rounded text-sm dark:bg-yellow-900 dark:text-yellow-100">
            <p>
              Akcja warunkowa - wykonuje różne akcje w zależności od spełnienia warunku.
              Implementacja pełnego edytora warunkowego wykracza poza zakres tego przykładu.
            </p>
          </div>
        );
        
      case 'DELAYED':
        return (
          <div className="space-y-2">
            <div className="bg-yellow-50 p-2 rounded text-sm dark:bg-yellow-900 dark:text-yellow-100">
              <p>
                Akcja opóźniona - wykonuje akcję po określonym czasie.
                Implementacja pełnego edytora akcji opóźnionej wykracza poza zakres tego przykładu.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Opóźnienie (ms):
              </label>
              <input
                type="number"
                value={action.delay || 1000}
                onChange={(e) => handleUpdateAction(index, { ...action, delay: parseInt(e.target.value) || 1000 })}
                min="100"
                step="100"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between dark:text-gray-400">
                <span>{(action.delay / 1000).toFixed(1)} sekund</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return <p>Nieznany typ akcji: {action.type}</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Dodaj nową akcję:
          </label>
          <select
            value={newActionType}
            onChange={(e) => setNewActionType(e.target.value)}
            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {actionTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
        <Button
          label="Dodaj"
          onClick={handleAddAction}
          variant="secondary"
          icon={<FaPlus />}
        />
      </div>
      
      {actions.length === 0 ? (
        <div className="p-3 bg-gray-50 text-center rounded border dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
          Brak zdefiniowanych akcji. Dodaj pierwszą akcję powyżej.
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div key={index} className="p-3 bg-white rounded border shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <h4 className="font-medium text-sm dark:text-gray-300">
                    {actionTypes.find(t => t.id === action.type)?.label || action.type}
                  </h4>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleMoveAction(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <FaArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMoveAction(index, 'down')}
                    disabled={index === actions.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <FaArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => handleRemoveAction(index)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
              
              {renderActionForm(action, index)}
            </div>
          ))}
        </div>
      )}
      
      {actions.length > 0 && (
        <div className="text-sm bg-blue-50 p-2 rounded dark:bg-blue-900 dark:text-blue-100">
          <h4 className="font-medium">Kolejność wykonywania</h4>
          <p>
            Akcje są wykonywane w kolejności od góry do dołu. 
            Możesz zmienić kolejność używając strzałek przy każdej akcji.
          </p>
        </div>
      )}
    </div>
  );
};

ActionBuilder.propTypes = {
  actions: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  allScenes: PropTypes.object.isRequired
};

export default ActionBuilder;