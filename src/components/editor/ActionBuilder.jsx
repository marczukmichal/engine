import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import { FaPlus, FaTrash, FaExchangeAlt } from 'react-icons/fa';

/**
 * Komponent budowniczego warunków
 */
const ConditionBuilder = ({ condition, onUpdate }) => {
  // Typy dostępnych warunków
  const conditionTypes = [
    { id: 'HAS_ITEM', label: 'Posiadanie przedmiotu' },
    { id: 'FLAG', label: 'Wartość flagi' },
    { id: 'COUNTER', label: 'Wartość licznika' },
    { id: 'AND', label: 'Wszystkie warunki (AND)' },
    { id: 'OR', label: 'Dowolny warunek (OR)' },
    { id: 'NOT', label: 'Negacja warunku (NOT)' },
    { id: 'VISIT_COUNT', label: 'Liczba odwiedzin sceny' },
    { id: 'HAS_ITEMS_COMBINATION', label: 'Kombinacja przedmiotów' },
    { id: 'ATTRIBUTE', label: 'Wartość atrybutu' },
    { id: 'TIME_PASSED', label: 'Czas od zdarzenia' }
  ];
  
  // Operatory porównywania
  const comparisonOperators = [
    { id: '===', label: 'równe (===)' },
    { id: '!==', label: 'różne (!==)' },
    { id: '>', label: 'większe (>)' },
    { id: '>=', label: 'większe/równe (>=)' },
    { id: '<', label: 'mniejsze (<)' },
    { id: '<=', label: 'mniejsze/równe (<=)' },
    { id: 'includes', label: 'zawiera (dla tablic)' }
  ];
  
  // Stan lokalny dla nowego warunku
  const [newConditionType, setNewConditionType] = useState('HAS_ITEM');
  
  // Utworzenie podstawowego warunku na podstawie wybranego typu
  const createNewCondition = (type) => {
    switch (type) {
      case 'HAS_ITEM':
        return { type, itemId: '', quantity: 1 };
      case 'FLAG':
        return { type, flagName: '', operator: '===', value: true };
      case 'COUNTER':
        return { type, counterName: '', operator: '>', value: 0 };
      case 'AND':
      case 'OR':
        return { type, conditions: [] };
      case 'NOT':
        return { type, condition: null };
      case 'VISIT_COUNT':
        return { type, sceneId: '', operator: '>=', value: 1 };
      case 'HAS_ITEMS_COMBINATION':
        return { type, items: [] };
      case 'ATTRIBUTE':
        return { type, attributeName: '', operator: '>=', value: 0 };
      case 'TIME_PASSED':
        return { type, id: `time_${Date.now()}`, milliseconds: 5000 };
      default:
        return { type: 'HAS_ITEM', itemId: '', quantity: 1 };
    }
  };
  
  // Inicjalizacja warunku jeśli nie istnieje
  useEffect(() => {
    if (!condition) {
      onUpdate(createNewCondition(newConditionType));
    }
  }, []);
  
  // Obsługa zmiany typu warunku
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    onUpdate(createNewCondition(newType));
    setNewConditionType(newType);
  };
  
  // Obsługa zmiany pola warunku
  const handleFieldChange = (field, value) => {
    onUpdate({
      ...condition,
      [field]: value
    });
  };
  
  // Dodanie podwarunku do warunku złożonego
  const handleAddSubcondition = () => {
    if (condition.type === 'AND' || condition.type === 'OR') {
      onUpdate({
        ...condition,
        conditions: [...condition.conditions, createNewCondition('HAS_ITEM')]
      });
    } else if (condition.type === 'NOT' && !condition.condition) {
      onUpdate({
        ...condition,
        condition: createNewCondition('HAS_ITEM')
      });
    } else if (condition.type === 'HAS_ITEMS_COMBINATION') {
      onUpdate({
        ...condition,
        items: [...condition.items, { id: '', quantity: 1 }]
      });
    }
  };
  
  // Aktualizacja podwarunku w warunku złożonym
  const handleUpdateSubcondition = (index, updatedCondition) => {
    if (condition.type === 'AND' || condition.type === 'OR') {
      const updatedConditions = [...condition.conditions];
      updatedConditions[index] = updatedCondition;
      
      onUpdate({
        ...condition,
        conditions: updatedConditions
      });
    } else if (condition.type === 'NOT') {
      onUpdate({
        ...condition,
        condition: updatedCondition
      });
    } else if (condition.type === 'HAS_ITEMS_COMBINATION') {
      const updatedItems = [...condition.items];
      updatedItems[index] = updatedCondition;
      
      onUpdate({
        ...condition,
        items: updatedItems
      });
    }
  };
  
  // Usunięcie podwarunku z warunku złożonego
  const handleRemoveSubcondition = (index) => {
    if (condition.type === 'AND' || condition.type === 'OR') {
      const updatedConditions = [...condition.conditions];
      updatedConditions.splice(index, 1);
      
      onUpdate({
        ...condition,
        conditions: updatedConditions
      });
    } else if (condition.type === 'NOT') {
      onUpdate({
        ...condition,
        condition: null
      });
    } else if (condition.type === 'HAS_ITEMS_COMBINATION') {
      const updatedItems = [...condition.items];
      updatedItems.splice(index, 1);
      
      onUpdate({
        ...condition,
        items: updatedItems
      });
    }
  };
  
  // Renderowanie formularza w zależności od typu warunku
  const renderConditionForm = () => {
    if (!condition) return null;
    
    switch (condition.type) {
      case 'HAS_ITEM':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                ID przedmiotu:
              </label>
              <input
                type="text"
                value={condition.itemId || ''}
                onChange={(e) => handleFieldChange('itemId', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. klucz_do_piwnicy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wymagana ilość:
              </label>
              <input
                type="number"
                value={condition.quantity || 1}
                onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'FLAG':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa flagi:
              </label>
              <input
                type="text"
                value={condition.flagName || ''}
                onChange={(e) => handleFieldChange('flagName', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. spotkany_npc_jan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Operator:
              </label>
              <select
                value={condition.operator || '==='}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {comparisonOperators.map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wartość:
              </label>
              <div className="flex items-center">
                <select
                  value={typeof condition.value}
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
                    
                    handleFieldChange('value', newValue);
                  }}
                  className="px-2 py-1 border rounded mr-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="boolean">Boolean</option>
                  <option value="number">Liczba</option>
                  <option value="string">Tekst</option>
                </select>
                
                {typeof condition.value === 'boolean' ? (
                  <select
                    value={condition.value.toString()}
                    onChange={(e) => handleFieldChange('value', e.target.value === 'true')}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="true">Prawda</option>
                    <option value="false">Fałsz</option>
                  </select>
                ) : typeof condition.value === 'number' ? (
                  <input
                    type="number"
                    value={condition.value}
                    onChange={(e) => handleFieldChange('value', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={condition.value || ''}
                    onChange={(e) => handleFieldChange('value', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>
        );
        
      case 'COUNTER':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa licznika:
              </label>
              <input
                type="text"
                value={condition.counterName || ''}
                onChange={(e) => handleFieldChange('counterName', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. liczba_zabojstw"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Operator:
              </label>
              <select
                value={condition.operator || '>'}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {comparisonOperators.slice(0, 6).map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wartość:
              </label>
              <input
                type="number"
                value={condition.value || 0}
                onChange={(e) => handleFieldChange('value', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'AND':
      case 'OR':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium dark:text-gray-300">
                {condition.type === 'AND' ? 'Wszystkie warunki muszą być spełnione' : 'Dowolny z warunków musi być spełniony'}
              </h3>
              <Button
                label="Dodaj warunek"
                onClick={handleAddSubcondition}
                variant="secondary"
                small
                icon={<FaPlus />}
              />
            </div>
            
            {condition.conditions.length === 0 ? (
              <div className="p-2 bg-yellow-50 text-sm rounded dark:bg-yellow-900 dark:text-yellow-100">
                Brak warunków. Dodaj co najmniej jeden.
              </div>
            ) : (
              <div className="space-y-3 pl-3 border-l-2 border-blue-300 dark:border-blue-700">
                {condition.conditions.map((subcondition, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border dark:bg-gray-900 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm dark:text-gray-300">
                        Warunek #{index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveSubcondition(index)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <ConditionBuilder
                      condition={subcondition}
                      onUpdate={(updatedCondition) => handleUpdateSubcondition(index, updatedCondition)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'NOT':
        return (
          <div className="space-y-3">
            <h3 className="font-medium dark:text-gray-300">
              Negacja warunku (warunek NIE jest spełniony)
            </h3>
            
            {condition.condition ? (
              <div className="p-3 bg-gray-50 rounded border dark:bg-gray-900 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm dark:text-gray-300">
                    Negowany warunek
                  </h4>
                  <button
                    onClick={() => handleRemoveSubcondition(0)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
                <ConditionBuilder
                  condition={condition.condition}
                  onUpdate={(updatedCondition) => handleUpdateSubcondition(0, updatedCondition)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-2 dark:text-gray-400">
                  Brak warunku do zanegowania
                </p>
                <Button
                  label="Dodaj warunek do zanegowania"
                  onClick={handleAddSubcondition}
                  variant="secondary"
                  small
                  icon={<FaPlus />}
                />
              </div>
            )}
          </div>
        );
        
      case 'VISIT_COUNT':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                ID sceny:
              </label>
              <input
                type="text"
                value={condition.sceneId || ''}
                onChange={(e) => handleFieldChange('sceneId', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. scene_1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Operator:
              </label>
              <select
                value={condition.operator || '>='}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {comparisonOperators.slice(0, 6).map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Liczba odwiedzin:
              </label>
              <input
                type="number"
                value={condition.value || 1}
                onChange={(e) => handleFieldChange('value', parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'HAS_ITEMS_COMBINATION':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium dark:text-gray-300">
                Posiadanie kombinacji przedmiotów
              </h3>
              <Button
                label="Dodaj przedmiot"
                onClick={handleAddSubcondition}
                variant="secondary"
                small
                icon={<FaPlus />}
              />
            </div>
            
            {condition.items.length === 0 ? (
              <div className="p-2 bg-yellow-50 text-sm rounded dark:bg-yellow-900 dark:text-yellow-100">
                Brak przedmiotów. Dodaj co najmniej jeden.
              </div>
            ) : (
              <div className="space-y-2">
                {condition.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item.id || ''}
                      onChange={(e) => handleUpdateSubcondition(index, { ...item, id: e.target.value })}
                      className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="ID przedmiotu"
                    />
                    <input
                      type="number"
                      value={item.quantity || 1}
                      onChange={(e) => handleUpdateSubcondition(index, { ...item, quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => handleRemoveSubcondition(index)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'ATTRIBUTE':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Nazwa atrybutu:
              </label>
              <input
                type="text"
                value={condition.attributeName || ''}
                onChange={(e) => handleFieldChange('attributeName', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. sila, zrecznosc, inteligencja"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Operator:
              </label>
              <select
                value={condition.operator || '>='}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {comparisonOperators.slice(0, 6).map(op => (
                  <option key={op.id} value={op.id}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Wartość:
              </label>
              <input
                type="number"
                value={condition.value || 0}
                onChange={(e) => handleFieldChange('value', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );
        
      case 'TIME_PASSED':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Identyfikator warunku:
              </label>
              <input
                type="text"
                value={condition.id || `time_${Date.now()}`}
                onChange={(e) => handleFieldChange('id', e.target.value)}
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="np. time_since_npc_talk"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Unikalny identyfikator używany do śledzenia czasu
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Czas w milisekundach:
              </label>
              <input
                type="number"
                value={condition.milliseconds || 5000}
                onChange={(e) => handleFieldChange('milliseconds', parseInt(e.target.value) || 5000)}
                min="1000"
                step="1000"
                className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between dark:text-gray-400">
                <span>{(condition.milliseconds / 1000).toFixed(1)} sekund</span>
                <span>{(condition.milliseconds / 60000).toFixed(1)} minut</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return <p>Nieznany typ warunku: {condition.type}</p>;
    }
  };
  
  // Główny komponent
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Typ warunku:
        </label>
        <select
          value={condition?.type || newConditionType}
          onChange={handleTypeChange}
          className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {conditionTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>
      
      {renderConditionForm()}
      
      <div className="text-sm bg-blue-50 p-2 rounded dark:bg-blue-900 dark:text-blue-100">
        <h4 className="font-medium">Jak działają warunki?</h4>
        <p>
          Warunki określają, kiedy opcja wyboru jest dostępna dla gracza. 
          Jeśli warunek nie jest spełniony, gracz nie zobaczy tego wyboru.
        </p>
      </div>
    </div>
  );
};

ConditionBuilder.propTypes = {
  condition: PropTypes.object,
  onUpdate: PropTypes.func.isRequired
};

export default ConditionBuilder;