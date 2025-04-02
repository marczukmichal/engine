/**
 * Klasa obsługująca serializację i deserializację stanu gry
 */
export class GameSerializer {
    /**
     * Serializuj stan gry do formatu JSON
     * @param {Object} gameState - Stan gry
     * @returns {string} Zserializowany stan gry
     */
    serialize(gameState) {
      try {
        // Dodaj metadane do stanu gry
        const stateWithMetadata = {
          ...gameState,
          __metadata: {
            version: '1.0',
            timestamp: Date.now(),
            saveDate: new Date().toISOString()
          }
        };
        
        return JSON.stringify(stateWithMetadata);
      } catch (error) {
        console.error('Błąd podczas serializacji stanu gry:', error);
        throw error;
      }
    }
    
    /**
     * Deserializuj stan gry z formatu JSON
     * @param {string} serializedState - Zserializowany stan gry
     * @returns {Object} Stan gry
     */
    deserialize(serializedState) {
      try {
        const state = JSON.parse(serializedState);
        
        // Sprawdź wersję formatu zapisu
        if (state.__metadata && state.__metadata.version !== '1.0') {
          console.warn(`Wczytywanie zapisu w innej wersji (${state.__metadata.version}). Możliwe problemy z kompatybilnością.`);
        }
        
        return state;
      } catch (error) {
        console.error('Błąd podczas deserializacji stanu gry:', error);
        throw error;
      }
    }
    
    /**
     * Zapisz stan gry do LocalStorage
     * @param {Object} gameState - Stan gry
     * @param {string} slotName - Nazwa slotu zapisu
     * @returns {boolean} Czy zapis się powiódł
     */
    saveToLocalStorage(gameState, slotName = 'autosave') {
      try {
        const serializedState = this.serialize(gameState);
        localStorage.setItem(`savegame_${slotName}`, serializedState);
        
        // Aktualizuj indeks zapisów
        this.updateSaveIndex(slotName);
        
        return true;
      } catch (error) {
        console.error('Błąd podczas zapisywania do localStorage:', error);
        return false;
      }
    }
    
    /**
     * Wczytaj stan gry z LocalStorage
     * @param {string} slotName - Nazwa slotu zapisu
     * @returns {Object|null} Stan gry lub null w przypadku błędu
     */
    loadFromLocalStorage(slotName = 'autosave') {
      try {
        const serializedState = localStorage.getItem(`savegame_${slotName}`);
        if (!serializedState) return null;
        
        return this.deserialize(serializedState);
      } catch (error) {
        console.error('Błąd podczas wczytywania z localStorage:', error);
        return null;
      }
    }
    
    /**
     * Pobierz listę dostępnych zapisów
     * @returns {Array} Lista informacji o zapisach
     */
    getSaveList() {
      try {
        // Pobierz indeks zapisów
        const saveIndexJSON = localStorage.getItem('savegame_index');
        const saveIndex = saveIndexJSON ? JSON.parse(saveIndexJSON) : {};
        
        const saveList = [];
        
        // Przejdź przez wszystkie zapisane stany
        for (const slotName in saveIndex) {
          if (saveIndex.hasOwnProperty(slotName)) {
            const saveInfo = saveIndex[slotName];
            
            // Sprawdź czy zapis nadal istnieje
            const saveExists = localStorage.getItem(`savegame_${slotName}`) !== null;
            if (saveExists) {
              saveList.push({
                slotName,
                ...saveInfo
              });
            } else {
              // Usuń z indeksu nieistniejące zapisy
              delete saveIndex[slotName];
            }
          }
        }
        
        // Zaktualizuj indeks jeśli usunięto nieistniejące zapisy
        localStorage.setItem('savegame_index', JSON.stringify(saveIndex));
        
        return saveList.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error('Błąd podczas pobierania listy zapisów:', error);
        return [];
      }
    }
    
    /**
     * Usuń zapis gry
     * @param {string} slotName - Nazwa slotu zapisu
     * @returns {boolean} Czy usunięcie się powiodło
     */
    deleteSave(slotName) {
      try {
        localStorage.removeItem(`savegame_${slotName}`);
        
        // Aktualizuj indeks zapisów
        const saveIndexJSON = localStorage.getItem('savegame_index');
        const saveIndex = saveIndexJSON ? JSON.parse(saveIndexJSON) : {};
        
        if (saveIndex[slotName]) {
          delete saveIndex[slotName];
          localStorage.setItem('savegame_index', JSON.stringify(saveIndex));
        }
        
        return true;
      } catch (error) {
        console.error('Błąd podczas usuwania zapisu:', error);
        return false;
      }
    }
    
    /**
     * Aktualizuj indeks zapisów
     * @param {string} slotName - Nazwa slotu zapisu
     * @private
     */
    updateSaveIndex(slotName) {
      try {
        // Pobierz aktualny indeks zapisów
        const saveIndexJSON = localStorage.getItem('savegame_index');
        const saveIndex = saveIndexJSON ? JSON.parse(saveIndexJSON) : {};
        
        // Pobierz metadane z zapisu
        const serializedState = localStorage.getItem(`savegame_${slotName}`);
        if (!serializedState) return;
        
        const state = JSON.parse(serializedState);
        const metadata = state.__metadata || { timestamp: Date.now(), saveDate: new Date().toISOString() };
        
        // Aktualizuj indeks o informacje o zapisie
        saveIndex[slotName] = {
          timestamp: metadata.timestamp,
          saveDate: metadata.saveDate,
          currentScene: state.currentScene,
          description: state.description || slotName
        };
        
        // Zapisz zaktualizowany indeks
        localStorage.setItem('savegame_index', JSON.stringify(saveIndex));
      } catch (error) {
        console.error('Błąd podczas aktualizacji indeksu zapisów:', error);
      }
    }
    
    /**
     * Eksportuj zapis gry do pliku
     * @param {string} slotName - Nazwa slotu zapisu
     * @returns {Blob} Blob z danymi zapisu
     */
    exportSaveToFile(slotName = 'autosave') {
      try {
        const serializedState = localStorage.getItem(`savegame_${slotName}`);
        if (!serializedState) throw new Error(`Zapis "${slotName}" nie istnieje!`);
        
        const blob = new Blob([serializedState], { type: 'application/json' });
        return blob;
      } catch (error) {
        console.error('Błąd podczas eksportu zapisu do pliku:', error);
        throw error;
      }
    }
    
    /**
     * Importuj zapis gry z pliku
     * @param {File} file - Plik z zapisem gry
     * @returns {Promise<Object>} Obiekt z danymi zapisu
     */
    importSaveFromFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const serializedState = event.target.result;
            const gameState = this.deserialize(serializedState);
            resolve(gameState);
          } catch (error) {
            reject(new Error('Nieprawidłowy format pliku zapisu gry.'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Błąd podczas odczytu pliku.'));
        };
        
        reader.readAsText(file);
      });
    }
  }