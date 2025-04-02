// Główna klasa silnika gry przygodowej
import { EventEmitter } from './EventEmitter';
import { StateManager } from './StateManager';
import { ActionHandler } from '../modules/ActionHandler';
import { ConditionEvaluator } from '../modules/ConditionEvaluator';
import { GameSerializer } from '../modules/GameSerializer';
import { MediaManager } from '../modules/MediaManager';

export class AdventureEngine {
  /**
   * Inicjalizacja silnika gry
   * @param {Object} config - Konfiguracja początkowa gry
   */
  constructor(config = {}) {
    this.eventEmitter = new EventEmitter();
    this.stateManager = new StateManager(config);
    this.gameData = {
      scenes: config.scenes || {},
      title: config.title || 'Nowa Gra Przygodowa',
      author: config.author || 'Anonimowy Autor',
      version: config.version || '1.0.0',
      startScene: config.startScene || null,
      resources: config.resources || {
        images: {},
        audio: {},
        video: {}
      }
    };
    
    // Inicjalizacja modułów
    this.serializer = new GameSerializer();
    this.mediaManager = new MediaManager(this.gameData.resources);
    this.conditionEvaluator = new ConditionEvaluator(this);
    this.actionHandler = new ActionHandler(this);
    
    // Jeśli jest zdefiniowana scena startowa, przejdź do niej
    if (this.gameData.startScene) {
      this.goToScene(this.gameData.startScene);
    }
  }
  
  /**
   * Zarejestruj nasłuchiwanie na zdarzenie
   * @param {string} eventName - Nazwa zdarzenia
   * @param {Function} callback - Funkcja wywoływana przy zdarzeniu
   */
  on(eventName, callback) {
    return this.eventEmitter.on(eventName, callback);
  }
  
  /**
   * Usuń nasłuchiwanie na zdarzenie
   * @param {string} eventName - Nazwa zdarzenia
   * @param {Function} callback - Funkcja do usunięcia
   */
  off(eventName, callback) {
    this.eventEmitter.off(eventName, callback);
  }
  
  /**
   * Przejdź do wskazanej sceny
   * @param {string} sceneId - Identyfikator sceny
   */
  goToScene(sceneId) {
    if (!this.gameData.scenes[sceneId]) {
      console.error(`Scena "${sceneId}" nie istnieje!`);
      return false;
    }
    
    // Dodaj aktualną scenę do historii
    const currentScene = this.stateManager.getState('currentScene');
    if (currentScene) {
      const history = this.stateManager.getState('history') || [];
      this.stateManager.setState('history', [...history, currentScene]);
    }
    
    // Ustaw nową scenę
    this.stateManager.setState('currentScene', sceneId);
    
    // Uruchom akcje wejścia dla sceny
    const scene = this.gameData.scenes[sceneId];
    if (scene.onEnter && Array.isArray(scene.onEnter)) {
      scene.onEnter.forEach(action => this.actionHandler.executeAction(action));
    }
    
    // Wyemituj zdarzenie zmiany sceny
    this.eventEmitter.emit('sceneChanged', sceneId);
    
    return true;
  }
  
  /**
   * Pobierz aktualną scenę
   * @returns {Object} Obiekt sceny
   */
  getCurrentScene() {
    const sceneId = this.stateManager.getState('currentScene');
    if (!sceneId) return null;
    return this.gameData.scenes[sceneId];
  }
  
  /**
   * Pobierz dostępne opcje wyboru dla aktualnej sceny
   * @returns {Array} Lista dostępnych opcji
   */
  getAvailableChoices() {
    const scene = this.getCurrentScene();
    if (!scene || !scene.choices) return [];
    
    return scene.choices.filter(choice => {
      // Jeśli wybór nie ma warunku, jest zawsze dostępny
      if (!choice.condition) return true;
      
      // W przeciwnym razie sprawdź warunek
      return this.conditionEvaluator.evaluate(choice.condition);
    });
  }
  
  /**
   * Wykonaj wybór
   * @param {number} choiceIndex - Indeks wybranej opcji
   * @returns {boolean} Czy wybór się powiódł
   */
  makeChoice(choiceIndex) {
    const choices = this.getAvailableChoices();
    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      console.error('Nieprawidłowy indeks wyboru!');
      return false;
    }
    
    const choice = choices[choiceIndex];
    
    // Wykonaj akcje powiązane z wyborem
    if (choice.actions && Array.isArray(choice.actions)) {
      choice.actions.forEach(action => this.actionHandler.executeAction(action));
    }
    
    // Przejdź do następnej sceny jeśli jest określona
    if (choice.nextScene) {
      return this.goToScene(choice.nextScene);
    }
    
    // Wyemituj zdarzenie wykonania wyboru
    this.eventEmitter.emit('choiceMade', choiceIndex);
    
    return true;
  }
  
  /**
   * Dodaj przedmiot do ekwipunku
   * @param {string} itemId - Identyfikator przedmiotu
   * @param {number} quantity - Ilość (domyślnie 1)
   */
  addToInventory(itemId, quantity = 1) {
    const inventory = this.stateManager.getState('inventory') || [];
    const existingItem = inventory.find(item => item.id === itemId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      this.stateManager.setState('inventory', [...inventory]);
    } else {
      this.stateManager.setState('inventory', [...inventory, { id: itemId, quantity }]);
    }
    
    // Wyemituj zdarzenie zmiany ekwipunku
    this.eventEmitter.emit('inventoryChanged', this.stateManager.getState('inventory'));
  }
  
  /**
   * Usuń przedmiot z ekwipunku
   * @param {string} itemId - Identyfikator przedmiotu
   * @param {number} quantity - Ilość (domyślnie 1)
   * @returns {boolean} Czy usunięcie się powiodło
   */
  removeFromInventory(itemId, quantity = 1) {
    const inventory = this.stateManager.getState('inventory') || [];
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return false;
    
    const item = inventory[itemIndex];
    let newInventory;
    
    if (item.quantity <= quantity) {
      // Usuń cały przedmiot
      newInventory = inventory.filter((_, index) => index !== itemIndex);
    } else {
      // Zmniejsz ilość
      newInventory = [...inventory];
      newInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
    }
    
    this.stateManager.setState('inventory', newInventory);
    
    // Wyemituj zdarzenie zmiany ekwipunku
    this.eventEmitter.emit('inventoryChanged', this.stateManager.getState('inventory'));
    
    return true;
  }
  
  /**
   * Sprawdź czy gracz posiada przedmiot
   * @param {string} itemId - Identyfikator przedmiotu
   * @param {number} quantity - Wymagana ilość (domyślnie 1)
   * @returns {boolean} Czy gracz posiada przedmiot
   */
  hasItem(itemId, quantity = 1) {
    const inventory = this.stateManager.getState('inventory') || [];
    const item = inventory.find(item => item.id === itemId);
    return item && item.quantity >= quantity;
  }
  
  /**
   * Ustaw flagę stanu gry
   * @param {string} flagName - Nazwa flagi
   * @param {*} value - Wartość flagi
   */
  setFlag(flagName, value) {
    const flags = this.stateManager.getState('flags') || {};
    this.stateManager.setState('flags', { ...flags, [flagName]: value });
    
    // Wyemituj zdarzenie zmiany flag
    this.eventEmitter.emit('flagsChanged', this.stateManager.getState('flags'));
  }
  
  /**
   * Pobierz wartość flagi
   * @param {string} flagName - Nazwa flagi
   * @param {*} defaultValue - Wartość domyślna
   * @returns {*} Wartość flagi
   */
  getFlag(flagName, defaultValue = null) {
    const flags = this.stateManager.getState('flags') || {};
    return flags.hasOwnProperty(flagName) ? flags[flagName] : defaultValue;
  }
  
  /**
   * Ustaw licznik
   * @param {string} counterName - Nazwa licznika
   * @param {number} value - Wartość licznika
   */
  setCounter(counterName, value) {
    const counters = this.stateManager.getState('counters') || {};
    this.stateManager.setState('counters', { ...counters, [counterName]: value });
    
    // Wyemituj zdarzenie zmiany liczników
    this.eventEmitter.emit('countersChanged', this.stateManager.getState('counters'));
  }
  
  /**
   * Zwiększ licznik o podaną wartość
   * @param {string} counterName - Nazwa licznika
   * @param {number} increment - Wartość zwiększenia
   */
  incrementCounter(counterName, increment = 1) {
    const counters = this.stateManager.getState('counters') || {};
    const currentValue = counters[counterName] || 0;
    
    this.stateManager.setState('counters', { 
      ...counters, 
      [counterName]: currentValue + increment 
    });
    
    // Wyemituj zdarzenie zmiany liczników
    this.eventEmitter.emit('countersChanged', this.stateManager.getState('counters'));
  }
  
  /**
   * Pobierz wartość licznika
   * @param {string} counterName - Nazwa licznika
   * @param {number} defaultValue - Wartość domyślna
   * @returns {number} Wartość licznika
   */
  getCounter(counterName, defaultValue = 0) {
    const counters = this.stateManager.getState('counters') || {};
    return counters.hasOwnProperty(counterName) ? counters[counterName] : defaultValue;
  }
  
  /**
   * Zapisz stan gry
   * @param {string} slotName - Nazwa slotu zapisu
   * @returns {boolean} Czy zapis się powiódł
   */
  saveGame(slotName = 'autosave') {
    try {
      const gameState = this.stateManager.getAllState();
      const saveData = this.serializer.serialize(gameState);
      localStorage.setItem(`savegame_${slotName}`, saveData);
      
      // Wyemituj zdarzenie zapisu gry
      this.eventEmitter.emit('gameSaved', slotName);
      
      return true;
    } catch (error) {
      console.error('Błąd podczas zapisywania gry:', error);
      
      // Wyemituj zdarzenie błędu zapisu
      this.eventEmitter.emit('saveError', error);
      
      return false;
    }
  }
  
  /**
   * Wczytaj stan gry
   * @param {string} slotName - Nazwa slotu zapisu
   * @returns {boolean} Czy wczytanie się powiodło
   */
  loadGame(slotName = 'autosave') {
    try {
      const saveData = localStorage.getItem(`savegame_${slotName}`);
      if (!saveData) return false;
      
      const loadedState = this.serializer.deserialize(saveData);
      this.stateManager.setAllState(loadedState);
      
      // Wyemituj zdarzenie wczytania gry
      this.eventEmitter.emit('gameLoaded', slotName);
      
      return true;
    } catch (error) {
      console.error('Błąd podczas wczytywania gry:', error);
      
      // Wyemituj zdarzenie błędu wczytywania
      this.eventEmitter.emit('loadError', error);
      
      return false;
    }
  }
  
  /**
   * Odśwież stan gry
   */
  reset() {
    this.stateManager.resetState();
    
    // Ustaw początkową scenę
    if (this.gameData.startScene) {
      this.stateManager.setState('currentScene', this.gameData.startScene);
    }
    
    // Wyemituj zdarzenie resetu gry
    this.eventEmitter.emit('gameReset');
  }
  
  /**
   * Cofnij do poprzedniej sceny
   * @returns {boolean} Czy cofnięcie się powiodło
   */
  goBack() {
    const history = this.stateManager.getState('history') || [];
    if (history.length === 0) return false;
    
    // Pobierz ostatnią scenę z historii
    const newHistory = [...history];
    const previousScene = newHistory.pop();
    
    // Aktualizuj historię i przejdź do poprzedniej sceny
    this.stateManager.setState('history', newHistory);
    this.stateManager.setState('currentScene', previousScene);
    
    // Wyemituj zdarzenie cofnięcia
    this.eventEmitter.emit('sceneChanged', previousScene);
    
    return true;
  }
  
  /**
   * Eksportuj dane gry do formatu JSON
   * @returns {string} Dane gry w formacie JSON
   */
  exportGameData() {
    return JSON.stringify({
      gameData: this.gameData,
      initialState: {
        currentScene: this.gameData.startScene,
        inventory: [],
        flags: {},
        counters: {}
      }
    }, null, 2);
  }
  
  /**
   * Importuj dane gry z formatu JSON
   * @param {string} jsonData - Dane gry w formacie JSON
   * @returns {boolean} Czy import się powiódł
   */
  importGameData(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);
      
      if (!importedData.gameData) {
        throw new Error('Nieprawidłowy format danych gry!');
      }
      
      this.gameData = importedData.gameData;
      
      // Zresetuj stan gry
      this.reset();
      
      // Ustaw początkowy stan jeśli jest dostępny
      if (importedData.initialState) {
        this.stateManager.setAllState(importedData.initialState);
      }
      
      // Wyemituj zdarzenie importu danych
      this.eventEmitter.emit('gameDataImported');
      
      return true;
    } catch (error) {
      console.error('Błąd podczas importowania danych gry:', error);
      
      // Wyemituj zdarzenie błędu importu
      this.eventEmitter.emit('importError', error);
      
      return false;
    }
  }
}