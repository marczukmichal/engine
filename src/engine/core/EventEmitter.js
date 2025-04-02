/**
 * Klasa implementująca wzorzec Observer do zarządzania zdarzeniami
 */
export class EventEmitter {
    constructor() {
      this.events = {};
    }
  
    /**
     * Zarejestruj nasłuchiwanie na zdarzenie
     * @param {string} eventName - Nazwa zdarzenia
     * @param {Function} callback - Funkcja wywoływana przy zdarzeniu
     * @returns {Function} Funkcja do usunięcia nasłuchiwania
     */
    on(eventName, callback) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      
      this.events[eventName].push(callback);
      
      // Zwróć funkcję, która usuwa nasłuchiwanie
      return () => this.off(eventName, callback);
    }
  
    /**
     * Usuń nasłuchiwanie na zdarzenie
     * @param {string} eventName - Nazwa zdarzenia
     * @param {Function} callback - Funkcja do usunięcia
     */
    off(eventName, callback) {
      if (!this.events[eventName]) return;
      
      this.events[eventName] = this.events[eventName].filter(
        cb => cb !== callback
      );
      
      // Usuń tablicę zdarzeń, jeśli jest pusta
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    }
  
    /**
     * Wyemituj zdarzenie
     * @param {string} eventName - Nazwa zdarzenia
     * @param {*} data - Dane przekazane do callbacków
     */
    emit(eventName, data) {
      if (!this.events[eventName]) return;
      
      // Wywołaj wszystkie callbacki zarejestrowane dla tego zdarzenia
      this.events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Błąd w callbacku dla zdarzenia "${eventName}":`, error);
        }
      });
    }
  
    /**
     * Zarejestruj nasłuchiwanie, które zostanie automatycznie usunięte po pierwszym wywołaniu
     * @param {string} eventName - Nazwa zdarzenia
     * @param {Function} callback - Funkcja wywoływana przy zdarzeniu
     */
    once(eventName, callback) {
      // Tworzenie funkcji opakowującej, która usuwa nasłuchiwanie po wywołaniu
      const onceCallback = (data) => {
        callback(data);
        this.off(eventName, onceCallback);
      };
      
      this.on(eventName, onceCallback);
    }
  
    /**
     * Usuń wszystkie nasłuchiwania dla danego zdarzenia
     * @param {string} eventName - Nazwa zdarzenia
     */
    removeAllListeners(eventName) {
      if (eventName) {
        delete this.events[eventName];
      } else {
        this.events = {};
      }
    }
  
    /**
     * Pobierz listę nasłuchiwań dla zdarzenia
     * @param {string} eventName - Nazwa zdarzenia
     * @returns {Array} Lista callbacków
     */
    listeners(eventName) {
      return this.events[eventName] || [];
    }
  
    /**
     * Sprawdź czy zdarzenie ma zarejestrowane nasłuchiwania
     * @param {string} eventName - Nazwa zdarzenia
     * @returns {boolean} Czy zdarzenie ma nasłuchiwania
     */
    hasListeners(eventName) {
      return !!this.events[eventName] && this.events[eventName].length > 0;
    }
  }