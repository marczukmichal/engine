/**
 * Klasa zarządzająca stanem gry
 */
export class StateManager {
    /**
     * Inicjalizacja stanu gry
     * @param {Object} config - Konfiguracja początkowa stanu
     */
    constructor(config = {}) {
      this.state = {
        currentScene: config.startScene || null,
        inventory: config.initialInventory || [],
        flags: config.initialFlags || {},
        counters: config.initialCounters || {},
        history: []
      };
      
      // Dodatkowe informacje o stanie
      this._lastUpdated = Date.now();
    }
    
    /**
     * Pobierz określony stan
     * @param {string} key - Klucz stanu
     * @param {*} defaultValue - Wartość domyślna
     * @returns {*} Wartość stanu
     */
    getState(key, defaultValue = null) {
      return this.state.hasOwnProperty(key) ? this.state[key] : defaultValue;
    }
    
    /**
     * Ustaw określony stan
     * @param {string} key - Klucz stanu
     * @param {*} value - Nowa wartość
     */
    setState(key, value) {
      this.state[key] = value;
      this._lastUpdated = Date.now();
    }
    
    /**
     * Pobierz cały stan
     * @returns {Object} Pełny stan gry
     */
    getAllState() {
      return { ...this.state };
    }
    
    /**
     * Ustaw cały stan
     * @param {Object} newState - Nowy stan gry
     */
    setAllState(newState) {
      this.state = { ...newState };
      this._lastUpdated = Date.now();
    }
    
    /**
     * Zresetuj stan gry do wartości początkowych
     */
    resetState() {
      this.state = {
        currentScene: null,
        inventory: [],
        flags: {},
        counters: {},
        history: []
      };
      this._lastUpdated = Date.now();
    }
    
    /**
     * Pobierz czas ostatniej aktualizacji stanu
     * @returns {number} Timestamp ostatniej aktualizacji
     */
    getLastUpdated() {
      return this._lastUpdated;
    }
    
    /**
     * Skopiuj obecny stan gry
     * @returns {Object} Kopia stanu gry
     */
    getStateCopy() {
      return JSON.parse(JSON.stringify(this.state));
    }
    
    /**
     * Sprawdź czy stan zawiera określony klucz
     * @param {string} key - Klucz stanu
     * @returns {boolean} Czy stan zawiera klucz
     */
    hasState(key) {
      return this.state.hasOwnProperty(key);
    }
    
    /**
     * Usuń określony stan
     * @param {string} key - Klucz stanu
     * @returns {boolean} Czy usunięcie się powiodło
     */
    removeState(key) {
      if (this.hasState(key)) {
        delete this.state[key];
        this._lastUpdated = Date.now();
        return true;
      }
      return false;
    }
  }