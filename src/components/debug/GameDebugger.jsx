import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import { FaPlay, FaStop, FaSave, FaRedo, FaBug, FaTrash } from 'react-icons/fa';
import StateInspector from './StateInspector';
import PathTracker from './PathTracker';
import { AdventureEngine } from '../../engine/core/AdventureEngine';

/**
 * Komponent do testowania i debugowania gry
 */
const GameDebugger = ({ projectData, startScene }) => {
  // Stan lokalny
  const [engine, setEngine] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [availableChoices, setAvailableChoices] = useState([]);
  const [gameState, setGameState] = useState({});
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showStateInspector, setShowStateInspector] = useState(false);
  const [showPathTracker, setShowPathTracker] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Inicjalizacja silnika gry
  const initializeEngine = () => {
    try {
      // Sprawdź, czy mamy wystarczające dane do uruchomienia gry
      if (!projectData.scenes || Object.keys(projectData.scenes).length === 0) {
        setErrorMessage('Brak zdefiniowanych scen w projekcie. Dodaj co najmniej jedną scenę.');
        return;
      }
      
      if (!startScene) {
        setErrorMessage('Nie wybrano sceny startowej. Ustaw scenę startową w ustawieniach projektu.');
        return;
      }
      
      if (!projectData.scenes[startScene]) {
        setErrorMessage(`Wybrana scena startowa (${startScene}) nie istnieje.`);
        return;
      }
      
      // Utwórz nową instancję silnika
      const gameEngine = new AdventureEngine({
        scenes: projectData.scenes,
        startScene: startScene,
        title: projectData.title,
        author: projectData.author,
        resources: projectData.resources
      });
      
      // Nasłuchiwanie na wydarzenia silnika
      gameEngine.on('sceneChanged', (sceneId) => {
        updateGameState(gameEngine);
        setHistory(prev => [...prev, { sceneId, timestamp: Date.now() }]);
      });
      
      gameEngine.on('inventoryChanged', () => {
        updateGameState(gameEngine);
      });
      
      gameEngine.on('flagsChanged', () => {
        updateGameState(gameEngine);
      });
      
      gameEngine.on('countersChanged', () => {
        updateGameState(gameEngine);
      });
      
      // Ustaw silnik w stanie lokalnym
      setEngine(gameEngine);
      
      // Aktualizuj stan gry
      updateGameState(gameEngine);
      
      // Ustaw, że gra jest uruchomiona
      setIsRunning(true);
      
      // Wyczyść ewentualne błędy
      setErrorMessage(null);
    } catch (error) {
      console.error('Błąd podczas inicjalizacji silnika gry:', error);
      setErrorMessage(`Błąd podczas inicjalizacji: ${error.message}`);
    }
  };
  
  // Aktualizacja stanu gry
  const updateGameState = (gameEngine) => {
    if (!gameEngine) return;
    
    // Pobierz aktualną scenę
    const scene = gameEngine.getCurrentScene();
    setCurrentScene(scene);
    
    // Pobierz dostępne wybory
    const choices = gameEngine.getAvailableChoices();
    setAvailableChoices(choices);
    
    // Pobierz pełny stan gry
    const state = gameEngine.stateManager.getAllState();
    setGameState(state);
  };
  
  // Zatrzymanie gry
  const stopGame = () => {
    setEngine(null);
    setCurrentScene(null);
    setAvailableChoices([]);
    setGameState({});
    setHistory([]);
    setIsRunning(false);
  };
  
  // Wykonanie wyboru
  const makeChoice = (choiceIndex) => {
    if (!engine) return;
    
    engine.makeChoice(choiceIndex);
  };
  
  // Resetowanie gry
  const resetGame = () => {
    if (!engine) return;
    
    engine.reset();
    setHistory([]);
    updateGameState(engine);
  };
  
  // Zapisanie stanu gry
  const saveGameState = () => {
    if (!engine) return;
    
    try {
      engine.saveGame('debug_save');
      alert('Stan gry został zapisany jako "debug_save".');
    } catch (error) {
      setErrorMessage(`Błąd podczas zapisu gry: ${error.message}`);
    }
  };
  
  // Wczytanie stanu gry
  const loadGameState = () => {
    if (!engine) return;
    
    try {
      const success = engine.loadGame('debug_save');
      
      if (success) {
        updateGameState(engine);
        alert('Stan gry został wczytany.');
      } else {
        alert('Nie znaleziono zapisanego stanu gry.');
      }
    } catch (error) {
      setErrorMessage(`Błąd podczas wczytywania gry: ${error.message}`);
    }
  };
  
  // Renderowanie panelu kontrolnego
  const renderControlPanel = () => {
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {!isRunning ? (
          <Button
            label="Uruchom grę"
            onClick={initializeEngine}
            variant="success"
            icon={<FaPlay />}
          />
        ) : (
          <>
            <Button
              label="Zatrzymaj"
              onClick={stopGame}
              variant="danger"
              icon={<FaStop />}
            />
            <Button
              label="Resetuj"
              onClick={resetGame}
              variant="warning"
              icon={<FaRedo />}
            />
            <Button
              label="Zapisz"
              onClick={saveGameState}
              variant="secondary"
              icon={<FaSave />}
            />
            <Button
              label="Wczytaj"
              onClick={loadGameState}
              variant="secondary"
              icon={<FaPlay />}
            />
            <Button
              label={showStateInspector ? "Ukryj inspektor" : "Pokaż inspektor"}
              onClick={() => setShowStateInspector(!showStateInspector)}
              variant="info"
              icon={<FaBug />}
            />
            <Button
              label={showPathTracker ? "Ukryj ścieżkę" : "Pokaż ścieżkę"}
              onClick={() => setShowPathTracker(!showPathTracker)}
              variant="info"
              icon={<FaTrash />}
            />
          </>
        )}
      </div>
    );
  };
  
  // Renderowanie aktualnej sceny
  const renderCurrentScene = () => {
    if (!currentScene) return null;
    
    return (
      <div className="mb-6 p-4 border rounded bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">{currentScene.title}</h2>
        <div className="prose prose-sm max-w-none mb-4 dark:prose-invert">
          {currentScene.content}
        </div>
        
        {availableChoices.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-lg font-medium dark:text-gray-300">Opcje:</h3>
            {availableChoices.map((choice, index) => (
              <button
                key={index}
                onClick={() => makeChoice(index)}
                className="w-full p-2 text-left border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded dark:bg-yellow-900 dark:text-yellow-200">
            Ta scena nie ma żadnych dostępnych wyborów.
          </div>
        )}
      </div>
    );
  };
  
  // Renderowanie błędów
  const renderError = () => {
    if (!errorMessage) return null;
    
    return (
      <div className="p-4 mb-4 bg-red-100 border border-red-300 text-red-800 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
        <h3 className="text-lg font-medium mb-1">Błąd</h3>
        <p>{errorMessage}</p>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 bg-gray-50 border-b dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">
          Debugger gry: {projectData.title}
        </h2>
        <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
          Testuj swoją grę w czasie rzeczywistym i sprawdzaj jej działanie.
        </p>
        
        {renderControlPanel()}
        {renderError()}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isRunning ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              {renderCurrentScene()}
            </div>
            
            {showStateInspector && (
              <div className="w-full md:w-96 lg:w-1/3">
                <StateInspector gameState={gameState} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <FaPlay className="text-4xl mb-2" />
            <p className="text-lg">Uruchom grę, aby rozpocząć testowanie</p>
            <p className="text-sm mt-2">
              Testowanie pozwala sprawdzić warunki, akcje i przepływ rozgrywki.
            </p>
          </div>
        )}
      </div>
      
      {showPathTracker && isRunning && (
        <div className="p-4 border-t dark:border-gray-800">
          <PathTracker history={history} scenes={projectData.scenes} />
        </div>
      )}
    </div>
  );
};

GameDebugger.propTypes = {
  projectData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    scenes: PropTypes.object.isRequired,
    resources: PropTypes.object
  }).isRequired,
  startScene: PropTypes.string
};

export default GameDebugger;