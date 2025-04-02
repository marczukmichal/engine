import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/layout/MainContent';
import Footer from '../components/layout/Footer';
import SceneEditor from '../components/editor/SceneEditor';
import StoryMap from '../components/editor/StoryMap';
import ResourceManager from '../components/editor/ResourceManager';
import GameDebugger from '../components/debug/GameDebugger';
import { EditorContextProvider } from '../contexts/EditorContext';
import { GameContextProvider } from '../contexts/GameContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { LocalStorageService } from '../services/storage/LocalStorageService';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import Toast from '../components/common/Toast';

const Editor = () => {
  // Stan projektu
  const [projectData, setProjectData] = useState({
    title: 'Nowy projekt',
    author: '',
    version: '1.0.0',
    scenes: {},
    startScene: null,
    resources: {
      images: {},
      audio: {},
      video: {}
    }
  });
  
  // Stan interfejsu
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNewSceneModal, setShowNewSceneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Hooks zarządzania historią i automatycznego zapisu
  const { canUndo, canRedo, addToHistory, undo, redo } = useUndoRedo(projectData);
  const { lastSaved, saveProject } = useAutoSave(projectData);
  
  // Obsługa nowej sceny
  const [newSceneData, setNewSceneData] = useState({
    id: '',
    title: ''
  });
  
  // Efekt inicjalizacji - wczytanie ostatniego projektu
  useEffect(() => {
    const loadLastProject = async () => {
      try {
        const lastProject = await LocalStorageService.getItem('lastProject');
        if (lastProject) {
          setProjectData(JSON.parse(lastProject));
          
          // Znajdź pierwszą scenę do wyświetlenia
          const scenes = JSON.parse(lastProject).scenes;
          if (scenes && Object.keys(scenes).length > 0) {
            setSelectedSceneId(Object.keys(scenes)[0]);
          }
          
          addNotification('Projekt wczytany pomyślnie', 'success');
        }
      } catch (error) {
        console.error('Błąd podczas wczytywania projektu:', error);
        addNotification('Nie udało się wczytać ostatniego projektu', 'error');
      }
    };
    
    loadLastProject();
    
    // Wczytanie preferencji użytkownika
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme ? savedTheme === 'dark' : userPrefersDark);
  }, []);
  
  // Efekt zmiany motywu
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  // Zapisz projekt przy zmianie danych
  useEffect(() => {
    if (Object.keys(projectData.scenes).length > 0) {
      saveProject();
    }
  }, [projectData, saveProject]);
  
  // Obsługa dodawania nowej sceny
  const handleAddScene = useCallback(() => {
    if (!newSceneData.id || !newSceneData.title) {
      addNotification('ID i tytuł sceny są wymagane', 'error');
      return;
    }
    
    // Sprawdź czy ID sceny jest unikalne
    if (projectData.scenes[newSceneData.id]) {
      addNotification(`Scena o ID "${newSceneData.id}" już istnieje`, 'error');
      return;
    }
    
    // Utwórz nową scenę
    const newScene = {
      id: newSceneData.id,
      title: newSceneData.title,
      content: 'Dodaj opis sceny tutaj...',
      choices: [],
      onEnter: [],
      onExit: []
    };
    
    // Aktualizuj projekt
    const updatedScenes = {
      ...projectData.scenes,
      [newSceneData.id]: newScene
    };
    
    // Zaktualizuj stan projektu
    const updatedProjectData = {
      ...projectData,
      scenes: updatedScenes,
      // Jeśli to pierwsza scena, ustaw ją jako startową
      startScene: projectData.startScene || newSceneData.id
    };
    
    // Dodaj do historii dla możliwości cofnięcia
    addToHistory(projectData);
    
    // Aktualizuj stan
    setProjectData(updatedProjectData);
    setSelectedSceneId(newSceneData.id);
    setNewSceneData({ id: '', title: '' });
    setShowNewSceneModal(false);
    
    addNotification(`Scena "${newSceneData.title}" została dodana`, 'success');
  }, [projectData, newSceneData, addToHistory]);
  
  // Obsługa usuwania sceny
  const handleDeleteScene = useCallback((sceneId) => {
    if (!sceneId || !projectData.scenes[sceneId]) {
      addNotification('Nieprawidłowa scena do usunięcia', 'error');
      return;
    }
    
    // Dodaj do historii dla możliwości cofnięcia
    addToHistory(projectData);
    
    // Przygotuj kopię scen bez usuwanej sceny
    const updatedScenes = { ...projectData.scenes };
    delete updatedScenes[sceneId];
    
    // Zaktualizuj odniesienia w innych scenach
    Object.values(updatedScenes).forEach(scene => {
      if (scene.choices) {
        scene.choices = scene.choices.filter(choice => choice.nextScene !== sceneId);
      }
    });
    
    // Zaktualizuj scenę startową jeśli potrzeba
    let updatedStartScene = projectData.startScene;
    if (projectData.startScene === sceneId) {
      updatedStartScene = Object.keys(updatedScenes).length > 0 ? Object.keys(updatedScenes)[0] : null;
    }
    
    // Aktualizuj stan projektu
    const updatedProjectData = {
      ...projectData,
      scenes: updatedScenes,
      startScene: updatedStartScene
    };
    
    setProjectData(updatedProjectData);
    
    // Jeśli usunęliśmy aktualnie wybraną scenę, wybierz inną
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(Object.keys(updatedScenes).length > 0 ? Object.keys(updatedScenes)[0] : null);
    }
    
    addNotification(`Scena "${sceneId}" została usunięta`, 'success');
  }, [projectData, selectedSceneId, addToHistory]);
  
  // Obsługa aktualizacji sceny
  const handleUpdateScene = useCallback((sceneId, updatedScene) => {
    if (!sceneId || !projectData.scenes[sceneId]) {
      addNotification('Nieprawidłowa scena do aktualizacji', 'error');
      return;
    }
    
    // Dodaj do historii dla możliwości cofnięcia
    addToHistory(projectData);
    
    // Aktualizuj projekt
    const updatedScenes = {
      ...projectData.scenes,
      [sceneId]: {
        ...projectData.scenes[sceneId],
        ...updatedScene
      }
    };
    
    // Zaktualizuj stan projektu
    setProjectData({
      ...projectData,
      scenes: updatedScenes
    });
    
    addNotification(`Scena "${sceneId}" została zaktualizowana`, 'success');
  }, [projectData, addToHistory]);
  
  // Dodawanie notyfikacji
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Automatyczne usuwanie notyfikacji po 5 sekundach
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  }, []);
  
  // Obsługa eksportu projektu
  const handleExportProject = useCallback((format) => {
    try {
      let exportData;
      let filename;
      let mimeType;
      
      switch (format) {
        case 'json':
          exportData = JSON.stringify(projectData, null, 2);
          filename = `${projectData.title.replace(/\s+/g, '_')}.json`;
          mimeType = 'application/json';
          break;
          
        case 'html':
          // Implementacja eksportu do HTML będzie w osobnym module
          exportData = generateHtmlExport(projectData);
          filename = `${projectData.title.replace(/\s+/g, '_')}.html`;
          mimeType = 'text/html';
          break;
          
        default:
          throw new Error(`Nieobsługiwany format eksportu: ${format}`);
      }
      
      // Tworzenie i pobieranie pliku
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification(`Projekt wyeksportowany do formatu ${format.toUpperCase()}`, 'success');
      setShowExportModal(false);
    } catch (error) {
      console.error('Błąd podczas eksportu projektu:', error);
      addNotification(`Błąd podczas eksportu: ${error.message}`, 'error');
    }
  }, [projectData]);
  
  // Funkcja generująca eksport HTML
  const generateHtmlExport = (data) => {
    // Ta implementacja powinna być w osobnym module
    // Tutaj tylko uproszczona wersja
    return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    /* Podstawowe style dla gry */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .scene {
      margin-bottom: 20px;
    }
    .choices {
      margin-top: 20px;
    }
    .choice {
      display: block;
      margin: 10px 0;
      padding: 10px;
      background-color: #f0f0f0;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
    }
    .choice:hover {
      background-color: #e0e0e0;
    }
    .inventory {
      border-top: 1px solid #ccc;
      margin-top: 20px;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <div id="game">
    <div id="scene" class="scene"></div>
    <div id="choices" class="choices"></div>
    <div id="inventory" class="inventory"></div>
  </div>

  <script>
    // Dane gry
    const gameData = ${JSON.stringify(data)};
    
    // Prosty silnik gry
    const gameEngine = {
      state: {
        currentScene: gameData.startScene,
        inventory: [],
        flags: {},
        counters: {}
      },
      
      // Inicjalizacja gry
      init() {
        this.renderScene();
        
        // Obsługa zapisywania/wczytywania stanu gry
        document.addEventListener('keydown', (e) => {
          // Ctrl+S - zapisz grę
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveGame();
          }
          
          // Ctrl+L - wczytaj grę
          if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            this.loadGame();
          }
        });
      },
      
      // Wyświetlanie aktualnej sceny
      renderScene() {
        const sceneId = this.state.currentScene;
        const scene = gameData.scenes[sceneId];
        
        if (!scene) {
          console.error(\`Scena "\${sceneId}" nie istnieje!\`);
          return;
        }
        
        // Wyświetl treść sceny
        document.getElementById('scene').innerHTML = \`
          <h2>\${scene.title}</h2>
          <div>\${scene.content}</div>
        \`;
        
        // Wyświetl dostępne wybory
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';
        
        // Filtruj wybory w zależności od warunków
        const availableChoices = scene.choices.filter(choice => {
          if (!choice.condition) return true;
          return this.evaluateCondition(choice.condition);
        });
        
        // Wyświetl dostępne wybory
        availableChoices.forEach((choice, index) => {
          const choiceButton = document.createElement('button');
          choiceButton.className = 'choice';
          choiceButton.textContent = choice.text;
          choiceButton.addEventListener('click', () => this.makeChoice(index));
          choicesContainer.appendChild(choiceButton);
        });
        
        // Wyświetl ekwipunek
        this.renderInventory();
      },
      
      // Wyświetlanie ekwipunku
      renderInventory() {
        const inventoryContainer = document.getElementById('inventory');
        if (this.state.inventory.length === 0) {
          inventoryContainer.innerHTML = '<p><em>Ekwipunek jest pusty</em></p>';
          return;
        }
        
        let inventoryHTML = '<h3>Ekwipunek:</h3><ul>';
        
        this.state.inventory.forEach(item => {
          inventoryHTML += \`<li>\${item.id} (x\${item.quantity})</li>\`;
        });
        
        inventoryHTML += '</ul>';
        inventoryContainer.innerHTML = inventoryHTML;
      },
      
      // Wykonanie wyboru
      makeChoice(choiceIndex) {
        const sceneId = this.state.currentScene;
        const scene = gameData.scenes[sceneId];
        
        // Filtruj wybory w zależności od warunków
        const availableChoices = scene.choices.filter(choice => {
          if (!choice.condition) return true;
          return this.evaluateCondition(choice.condition);
        });
        
        const choice = availableChoices[choiceIndex];
        if (!choice) return;
        
        // Wykonaj akcje związane z wyborem
        if (choice.actions && Array.isArray(choice.actions)) {
          choice.actions.forEach(action => this.executeAction(action));
        }
        
        // Przejdź do następnej sceny
        if (choice.nextScene) {
          this.state.currentScene = choice.nextScene;
          this.renderScene();
        }
      },
      
      // Ewaluacja warunków
      evaluateCondition(condition) {
        if (!condition) return true;
        
        switch (condition.type) {
          case 'HAS_ITEM':
            return this.hasItem(condition.itemId, condition.quantity || 1);
          
          case 'FLAG':
            const flagValue = this.state.flags[condition.flagName];
            
            switch (condition.operator) {
              case '===': return flagValue === condition.value;
              case '!==': return flagValue !== condition.value;
              case '>': return flagValue > condition.value;
              case '>=': return flagValue >= condition.value;
              case '<': return flagValue < condition.value;
              case '<=': return flagValue <= condition.value;
              default: return !!flagValue;
            }
          
          case 'COUNTER':
            const counterValue = this.state.counters[condition.counterName] || 0;
            
            switch (condition.operator) {
              case '===': return counterValue === condition.value;
              case '!==': return counterValue !== condition.value;
              case '>': return counterValue > condition.value;
              case '>=': return counterValue >= condition.value;
              case '<': return counterValue < condition.value;
              case '<=': return counterValue <= condition.value;
              default: return counterValue > 0;
            }
          
          case 'AND':
            return condition.conditions.every(subcondition => 
              this.evaluateCondition(subcondition)
            );
          
          case 'OR':
            return condition.conditions.some(subcondition => 
              this.evaluateCondition(subcondition)
            );
          
          case 'NOT':
            return !this.evaluateCondition(condition.condition);
          
          default:
            console.warn(\`Nieznany typ warunku: \${condition.type}\`);
            return true;
        }
      },
      
      // Wykonanie akcji
      executeAction(action) {
        if (!action || !action.type) return;
        
        switch (action.type) {
          case 'ADD_ITEM':
            this.addToInventory(action.itemId, action.quantity || 1);
            break;
          
          case 'REMOVE_ITEM':
            this.removeFromInventory(action.itemId, action.quantity || 1);
            break;
          
          case 'SET_FLAG':
            this.state.flags[action.flagName] = action.value;
            break;
          
          case 'SET_COUNTER':
            this.state.counters[action.counterName] = action.value;
            break;
          
          case 'INCREMENT_COUNTER':
            if (!this.state.counters[action.counterName]) {
              this.state.counters[action.counterName] = 0;
            }
            this.state.counters[action.counterName] += (action.increment || 1);
            break;
          
          case 'GO_TO_SCENE':
            this.state.currentScene = action.sceneId;
            this.renderScene();
            break;
          
          default:
            console.warn(\`Nieznany typ akcji: \${action.type}\`);
        }
      },
      
      // Obsługa ekwipunku
      hasItem(itemId, quantity = 1) {
        const item = this.state.inventory.find(item => item.id === itemId);
        return item && item.quantity >= quantity;
      },
      
      addToInventory(itemId, quantity = 1) {
        const existingItem = this.state.inventory.find(item => item.id === itemId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          this.state.inventory.push({ id: itemId, quantity });
        }
        
        this.renderInventory();
      },
      
      removeFromInventory(itemId, quantity = 1) {
        const itemIndex = this.state.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return;
        
        const item = this.state.inventory[itemIndex];
        
        if (item.quantity <= quantity) {
          // Usuń cały przedmiot
          this.state.inventory.splice(itemIndex, 1);
        } else {
          // Zmniejsz ilość
          item.quantity -= quantity;
        }
        
        this.renderInventory();
      },
      
      // Obsługa zapisu/odczytu stanu gry
      saveGame() {
        try {
          localStorage.setItem('gameState', JSON.stringify(this.state));
          alert('Gra została zapisana!');
        } catch (error) {
          console.error('Błąd podczas zapisywania gry:', error);
          alert('Nie udało się zapisać gry.');
        }
      },
      
      loadGame() {
        try {
          const savedState = localStorage.getItem('gameState');
          if (!savedState) {
            alert('Brak zapisanego stanu gry.');
            return;
          }
          
          this.state = JSON.parse(savedState);
          this.renderScene();
          alert('Gra została wczytana!');
        } catch (error) {
          console.error('Błąd podczas wczytywania gry:', error);
          alert('Nie udało się wczytać gry.');
        }
      }
    };
    
    // Inicjalizacja gry
    document.addEventListener('DOMContentLoaded', () => {
      gameEngine.init();
    });
  </script>
</body>
</html>`;
  };
  
  // Główny komponent interfejsu edytora
  return (
    <EditorContextProvider value={{
      projectData,
      setProjectData,
      selectedSceneId,
      setSelectedSceneId,
      canUndo,
      canRedo,
      undo,
      redo,
      lastSaved
    }}>
      <GameContextProvider>
        <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''}`}>
          <Header 
            title={projectData.title}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onSettings={() => setShowSettingsModal(true)}
            onExport={() => setShowExportModal(true)}
            onThemeToggle={() => setIsDarkMode(!isDarkMode)}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
          
          <div className="flex flex-1 overflow-hidden">
            {isSidebarOpen && (
              <Sidebar 
                scenes={projectData.scenes}
                selectedSceneId={selectedSceneId}
                onSelectScene={setSelectedSceneId}
                onAddScene={() => setShowNewSceneModal(true)}
                onDeleteScene={handleDeleteScene}
                startScene={projectData.startScene}
                onSetStartScene={(sceneId) => {
                  setProjectData({
                    ...projectData,
                    startScene: sceneId
                  });
                  addNotification(`Scena "${sceneId}" ustawiona jako startowa`, 'success');
                }}
              />
            )}
            
            <MainContent>
              <Tabs 
                tabs={[
                  { id: 'editor', label: 'Edytor scen' },
                  { id: 'map', label: 'Mapa historii' },
                  { id: 'resources', label: 'Zasoby' },
                  { id: 'test', label: 'Testowanie' }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              {activeTab === 'editor' && selectedSceneId && (
                <SceneEditor 
                  scene={projectData.scenes[selectedSceneId]}
                  allScenes={projectData.scenes}
                  onUpdateScene={(updatedScene) => handleUpdateScene(selectedSceneId, updatedScene)}
                />
              )}
              
              {activeTab === 'map' && (
                <StoryMap 
                  scenes={projectData.scenes}
                  startScene={projectData.startScene}
                  onSelectScene={setSelectedSceneId}
                />
              )}
              
              {activeTab === 'resources' && (
                <ResourceManager 
                  resources={projectData.resources}
                  onUpdateResources={(updatedResources) => {
                    setProjectData({
                      ...projectData,
                      resources: updatedResources
                    });
                  }}
                />
              )}
              
              {activeTab === 'test' && (
                <GameDebugger 
                  projectData={projectData}
                  startScene={projectData.startScene}
                />
              )}
            </MainContent>
          </div>
          
          <Footer 
            lastSaved={lastSaved}
            projectInfo={`${projectData.title} v${projectData.version}`}
          />
        </div>
        
        {/* Modal dodawania nowej sceny */}
        <Modal
          isOpen={showNewSceneModal}
          onClose={() => setShowNewSceneModal(false)}
          title="Dodaj nową scenę"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID Sceny:</label>
              <input
                type="text"
                value={newSceneData.id}
                onChange={(e) => setNewSceneData({...newSceneData, id: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="np. start_scene"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tytuł:</label>
              <input
                type="text"
                value={newSceneData.title}
                onChange={(e) => setNewSceneData({...newSceneData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="Tytuł sceny"
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                label="Anuluj"
                onClick={() => setShowNewSceneModal(false)}
                variant="secondary"
              />
              <Button
                label="Dodaj"
                onClick={handleAddScene}
                variant="primary"
              />
            </div>
          </div>
        </Modal>
        
        {/* Modal ustawień projektu */}
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Ustawienia projektu"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tytuł projektu:</label>
              <input
                type="text"
                value={projectData.title}
                onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Autor:</label>
              <input
                type="text"
                value={projectData.author}
                onChange={(e) => setProjectData({...projectData, author: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Wersja:</label>
              <input
                type="text"
                value={projectData.version}
                onChange={(e) => setProjectData({...projectData, version: e.target.value})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                label="Zamknij"
                onClick={() => setShowSettingsModal(false)}
                variant="primary"
              />
            </div>
          </div>
        </Modal>
        
        {/* Modal eksportu projektu */}
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Eksportuj projekt"
        >
          <div className="space-y-4">
            <p>Wybierz format eksportu:</p>
            
            <div className="flex flex-col space-y-2">
              <Button
                label="Eksportuj jako JSON"
                onClick={() => handleExportProject('json')}
                variant="secondary"
                fullWidth
              />
              <Button
                label="Eksportuj jako HTML"
                onClick={() => handleExportProject('html')}
                variant="secondary"
                fullWidth
              />
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Format JSON można później zaimportować ponownie do edytora.
              Format HTML to samodzielna gra, którą można udostępnić w internecie.
            </p>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                label="Anuluj"
                onClick={() => setShowExportModal(false)}
                variant="secondary"
              />
            </div>
          </div>
        </Modal>
        
        {/* Notyfikacje */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Toast
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            />
          ))}
        </div>
      </GameContextProvider>
    </EditorContextProvider>
  );
};

export default Editor;