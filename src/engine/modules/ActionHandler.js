/**
 * Klasa obsługująca wykonywanie akcji
 */
export class ActionHandler {
    /**
     * Inicjalizacja obsługi akcji
     * @param {Object} engine - Instancja silnika gry
     */
    constructor(engine) {
      this.engine = engine;
    }
    
    /**
     * Wykonaj akcję
     * @param {Object} action - Obiekt akcji
     * @returns {boolean} Czy akcja została wykonana
     */
    executeAction(action) {
      if (!action || !action.type) {
        console.error('Nieprawidłowy format akcji!');
        return false;
      }
      
      // Akcje związane z zarządzaniem ekwipunkiem
      if (action.type === 'ADD_ITEM') {
        this.engine.addToInventory(action.itemId, action.quantity || 1);
        return true;
      }
      
      else if (action.type === 'REMOVE_ITEM') {
        return this.engine.removeFromInventory(action.itemId, action.quantity || 1);
      }
      
      // Akcje związane z flagami stanu gry
      else if (action.type === 'SET_FLAG') {
        this.engine.setFlag(action.flagName, action.value);
        return true;
      }
      
      else if (action.type === 'TOGGLE_FLAG') {
        const currentValue = this.engine.getFlag(action.flagName, false);
        this.engine.setFlag(action.flagName, !currentValue);
        return true;
      }
      
      // Akcje związane z licznikami
      else if (action.type === 'SET_COUNTER') {
        this.engine.setCounter(action.counterName, action.value);
        return true;
      }
      
      else if (action.type === 'INCREMENT_COUNTER') {
        this.engine.incrementCounter(action.counterName, action.increment || 1);
        return true;
      }
      
      // Akcje nawigacyjne
      else if (action.type === 'GO_TO_SCENE') {
        return this.engine.goToScene(action.sceneId);
      }
      
      else if (action.type === 'GO_BACK') {
        return this.engine.goBack();
      }
      
      // Akcje związane z multimediami
      else if (action.type === 'PLAY_AUDIO') {
        this.engine.mediaManager.loadAudio(action.audioId)
          .then(audio => {
            audio.currentTime = 0;
            audio.volume = action.volume !== undefined ? action.volume : 1;
            if (action.loop) audio.loop = true;
            audio.play()
              .catch(err => console.error('Błąd podczas odtwarzania dźwięku:', err));
          })
          .catch(error => console.error('Błąd podczas ładowania dźwięku:', error));
        return true;
      }
      
      else if (action.type === 'STOP_AUDIO') {
        const audioCache = this.engine.mediaManager.cache.audio || {};
        const audio = audioCache[action.audioId];
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        return true;
      }
      
      else if (action.type === 'PLAY_VIDEO') {
        this.engine.mediaManager.loadVideo(action.videoId)
          .then(video => {
            video.currentTime = 0;
            video.volume = action.volume !== undefined ? action.volume : 1;
            if (action.loop) video.loop = true;
            video.play()
              .catch(err => console.error('Błąd podczas odtwarzania wideo:', err));
          })
          .catch(error => console.error('Błąd podczas ładowania wideo:', error));
        return true;
      }
      
      else if (action.type === 'STOP_VIDEO') {
        const videoCache = this.engine.mediaManager.cache.video || {};
        const video = videoCache[action.videoId];
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        return true;
      }
      
      // Akcje związane z zarządzaniem stanem gry
      else if (action.type === 'SAVE_GAME') {
        return this.engine.saveGame(action.slotName || 'autosave');
      }
      
      else if (action.type === 'LOAD_GAME') {
        return this.engine.loadGame(action.slotName || 'autosave');
      }
      
      else if (action.type === 'RESET_GAME') {
        this.engine.reset();
        return true;
      }
      
      // Akcje złożone
      else if (action.type === 'SEQUENCE') {
        if (!Array.isArray(action.actions)) {
          console.error('Sekwencja akcji musi być tablicą!');
          return false;
        }
        
        // Wykonaj wszystkie akcje w sekwencji
        for (const subAction of action.actions) {
          this.executeAction(subAction);
        }
        return true;
      }
      
      // Akcje warunkowe
      else if (action.type === 'CONDITIONAL') {
        if (!action.condition || !action.thenActions) {
          console.error('Nieprawidłowy format akcji warunkowej!');
          return false;
        }
        
        // Sprawdź warunek
        if (this.engine.conditionEvaluator.evaluate(action.condition)) {
          // Wykonaj akcje dla spełnionego warunku
          if (Array.isArray(action.thenActions)) {
            action.thenActions.forEach(subAction => this.executeAction(subAction));
          } else {
            this.executeAction(action.thenActions);
          }
        } else if (action.elseActions) {
          // Wykonaj akcje dla niespełnionego warunku
          if (Array.isArray(action.elseActions)) {
            action.elseActions.forEach(subAction => this.executeAction(subAction));
          } else {
            this.executeAction(action.elseActions);
          }
        }
        
        return true;
      }
      
      // Akcje opóźnione
      else if (action.type === 'DELAYED') {
        if (!action.action || action.delay === undefined) {
          console.error('Nieprawidłowy format akcji opóźnionej!');
          return false;
        }
        
        setTimeout(() => {
          this.executeAction(action.action);
        }, action.delay);
        
        return true;
      }
      
      // Akcje z systemem atrybutów (jeśli gra ma system atrybutów)
      else if (action.type === 'SET_ATTRIBUTE') {
        const attributes = this.engine.getFlag('attributes', {});
        const updatedAttributes = {
          ...attributes,
          [action.attributeName]: action.value
        };
        
        this.engine.setFlag('attributes', updatedAttributes);
        return true;
      }
      
      else if (action.type === 'MODIFY_ATTRIBUTE') {
        const attributes = this.engine.getFlag('attributes', {});
        const currentValue = attributes[action.attributeName] || 0;
        const updatedAttributes = {
          ...attributes,
          [action.attributeName]: currentValue + (action.delta || 0)
        };
        
        this.engine.setFlag('attributes', updatedAttributes);
        return true;
      }
      
      // Obsługa niestandardowych akcji (używane tylko w trybie deweloperskim)
      else if (action.type === 'CUSTOM' && action.executor) {
        try {
          // UWAGA: To podejście stwarza potencjalne zagrożenie bezpieczeństwa i powinno być używane tylko przez deweloperów
          // W produkcyjnej wersji należy rozważyć bardziej bezpieczne podejście
          const customExecFunction = new Function('engine', `
            try {
              return (${action.executor})(engine);
            } catch (e) {
              console.error('Błąd w niestandardowej akcji:', e);
              return false;
            }
          `);
          
          return customExecFunction(this.engine);
        } catch (error) {
          console.error('Błąd podczas wykonywania niestandardowej akcji:', error);
          return false;
        }
      }
      
      // Domyślnie dla nieznanych typów akcji
      console.warn(`Nieznany typ akcji: ${action.type}`);
      return false;
    }
    
    /**
     * Tworzy prostą akcję
     * @param {string} type - Typ akcji
     * @param {Object} params - Parametry akcji
     * @returns {Object} Obiekt akcji
     */
    createAction(type, params = {}) {
      return {
        type,
        ...params
      };
    }
    
    /**
     * Tworzy sekwencję akcji
     * @param {Array} actions - Lista akcji do wykonania w sekwencji
     * @returns {Object} Obiekt akcji sekwencyjnej
     */
    createSequence(actions) {
      return {
        type: 'SEQUENCE',
        actions
      };
    }
    
    /**
     * Tworzy akcję warunkową
     * @param {Object} condition - Warunek do sprawdzenia
     * @param {Object|Array} thenActions - Akcje do wykonania jeśli warunek jest spełniony
     * @param {Object|Array} elseActions - Akcje do wykonania jeśli warunek nie jest spełniony
     * @returns {Object} Obiekt akcji warunkowej
     */
    createConditionalAction(condition, thenActions, elseActions = null) {
      return {
        type: 'CONDITIONAL',
        condition,
        thenActions,
        elseActions
      };
    }
    
    /**
     * Tworzy akcję opóźnioną
     * @param {Object} action - Akcja do wykonania
     * @param {number} delay - Opóźnienie w milisekundach
     * @returns {Object} Obiekt akcji opóźnionej
     */
    createDelayedAction(action, delay) {
      return {
        type: 'DELAYED',
        action,
        delay
      };
    }
  }