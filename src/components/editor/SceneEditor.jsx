import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextEditor from './TextEditor';
import ChoiceEditor from './ChoiceEditor';
import ActionBuilder from './ActionBuilder';
import Button from '../common/Button';
import Tabs from '../common/Tabs';

/**
 * Komponent edytora pojedynczej sceny
 */
const SceneEditor = ({ scene, allScenes, onUpdateScene }) => {
  // Stan lokalny
  const [localScene, setLocalScene] = useState(scene);
  const [activeTab, setActiveTab] = useState('content');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Aktualizacja lokalnego stanu przy zmianie sceny
  useEffect(() => {
    setLocalScene(scene);
  }, [scene]);
  
  // Obsługa zapisu zmian
  const handleSave = () => {
    setIsSaving(true);
    
    // Symulacja asynchronicznego zapisu
    setTimeout(() => {
      onUpdateScene(localScene);
      setIsSaving(false);
    }, 300);
  };
  
  // Obsługa zmiany treści sceny
  const handleContentChange = (content) => {
    setLocalScene(prev => ({
      ...prev,
      content
    }));
  };
  
  // Obsługa zmiany tytułu sceny
  const handleTitleChange = (e) => {
    setLocalScene(prev => ({
      ...prev,
      title: e.target.value
    }));
  };
  
  // Obsługa dodawania nowego wyboru
  const handleAddChoice = () => {
    const newChoice = {
      id: `choice_${Date.now()}`,
      text: 'Nowy wybór',
      nextScene: '',
      condition: null,
      actions: []
    };
    
    setLocalScene(prev => ({
      ...prev,
      choices: [...(prev.choices || []), newChoice]
    }));
  };
  
  // Obsługa aktualizacji wyboru
  const handleUpdateChoice = (index, updatedChoice) => {
    const updatedChoices = [...localScene.choices];
    updatedChoices[index] = updatedChoice;
    
    setLocalScene(prev => ({
      ...prev,
      choices: updatedChoices
    }));
  };
  
  // Obsługa usuwania wyboru
  const handleDeleteChoice = (index) => {
    const updatedChoices = [...localScene.choices];
    updatedChoices.splice(index, 1);
    
    setLocalScene(prev => ({
      ...prev,
      choices: updatedChoices
    }));
  };
  
  // Obsługa zmiany kolejności wyborów
  const handleMoveChoice = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === localScene.choices.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedChoices = [...localScene.choices];
    
    // Zamień miejscami elementy
    [updatedChoices[index], updatedChoices[newIndex]] = 
      [updatedChoices[newIndex], updatedChoices[index]];
    
    setLocalScene(prev => ({
      ...prev,
      choices: updatedChoices
    }));
  };
  
  // Obsługa aktualizacji akcji wejścia
  const handleUpdateOnEnterActions = (actions) => {
    setLocalScene(prev => ({
      ...prev,
      onEnter: actions
    }));
  };
  
  // Obsługa aktualizacji akcji wyjścia
  const handleUpdateOnExitActions = (actions) => {
    setLocalScene(prev => ({
      ...prev,
      onExit: actions
    }));
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={localScene.title}
            onChange={handleTitleChange}
            className="text-xl font-semibold w-full px-2 py-1 border rounded"
            placeholder="Tytuł sceny"
          />
          <div className="text-sm text-gray-500">
            ID: {localScene.id}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            label={showAdvancedOptions ? "Ukryj opcje zaawansowane" : "Pokaż opcje zaawansowane"}
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            variant="secondary"
          />
          <Button
            label={isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            onClick={handleSave}
            variant="primary"
            disabled={isSaving}
          />
        </div>
      </div>
      
      <Tabs
        tabs={[
          { id: 'content', label: 'Treść' },
          { id: 'choices', label: 'Wybory' },
          ...(showAdvancedOptions ? [
            { id: 'actions', label: 'Akcje'},
            { id: 'metadata', label: 'Metadane' }
          ] : [])
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 overflow-y-auto p-2">
        {/* Zakładka edycji treści */}
        {activeTab === 'content' && (
          <div className="h-full">
            <TextEditor 
              initialContent={localScene.content} 
              onUpdate={handleContentChange}
            />
          </div>
        )}
        
        {/* Zakładka wyborów */}
        {activeTab === 'choices' && (
          <div className="space-y-4">
            <Button
              label="Dodaj nowy wybór"
              onClick={handleAddChoice}
              variant="secondary"
            />
            
            {localScene.choices && localScene.choices.length > 0 ? (
              <div className="space-y-6">
                {localScene.choices.map((choice, index) => (
                  <ChoiceEditor
                    key={choice.id || index}
                    choice={choice}
                    index={index}
                    allScenes={allScenes}
                    onUpdate={(updatedChoice) => handleUpdateChoice(index, updatedChoice)}
                    onDelete={() => handleDeleteChoice(index)}
                    onMoveUp={() => handleMoveChoice(index, 'up')}
                    onMoveDown={() => handleMoveChoice(index, 'down')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-100 rounded">
                <p>Ta scena nie ma jeszcze żadnych wyborów. Dodaj pierwszy!</p>
              </div>
            )}
          </div>
        )}
        
        {/* Zakładka akcji */}
        {activeTab === 'actions' && showAdvancedOptions && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Akcje przy wejściu do sceny:</h3>
              <ActionBuilder
                actions={localScene.onEnter || []}
                onUpdate={handleUpdateOnEnterActions}
                allScenes={allScenes}
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Akcje przy wyjściu ze sceny:</h3>
              <ActionBuilder
                actions={localScene.onExit || []}
                onUpdate={handleUpdateOnExitActions}
                allScenes={allScenes}
              />
            </div>
          </div>
        )}
        
        {/* Zakładka metadanych */}
        {activeTab === 'metadata' && showAdvancedOptions && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tagi sceny:</label>
              <input
                type="text"
                value={localScene.tags || ''}
                onChange={(e) => setLocalScene(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border rounded"
                placeholder="Tagi oddzielone przecinkami"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tagi pomagają organizować i wyszukiwać sceny
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Uwagi dla autora:</label>
              <textarea
                value={localScene.notes || ''}
                onChange={(e) => setLocalScene(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border rounded h-32"
                placeholder="Notatki dotyczące tej sceny"
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <h4 className="font-semibold text-yellow-800">Uwaga</h4>
              <p className="text-sm text-yellow-700">
                Zmiany dokonane w metadanych nie wpływają na przebieg gry, ale mogą być przydatne podczas tworzenia i organizacji projektu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

SceneEditor.propTypes = {
  scene: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    choices: PropTypes.array,
    onEnter: PropTypes.array,
    onExit: PropTypes.array,
    tags: PropTypes.string,
    notes: PropTypes.string
  }).isRequired,
  allScenes: PropTypes.object.isRequired,
  onUpdateScene: PropTypes.func.isRequired
};

export default SceneEditor;