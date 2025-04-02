/**
 * Klasa obsługująca ewaluację warunków
 */
export class ConditionEvaluator {
    /**
     * Inicjalizacja ewaluatora warunków
     * @param {Object} engine - Instancja silnika gry
     */
    constructor(engine) {
      this.engine = engine;
    }
    
    /**
     * Ewaluuj warunek
     * @param {Object} condition - Obiekt warunku
     * @returns {boolean} Czy warunek jest spełniony
     */
    evaluate(condition) {
      if (!condition) return true;
      
      // Obsługa złożonych warunków (AND, OR, NOT)
      if (condition.type === 'AND') {
        return condition.conditions.every(subCondition => this.evaluate(subCondition));
      } else if (condition.type === 'OR') {
        return condition.conditions.some(subCondition => this.evaluate(subCondition));
      } else if (condition.type === 'NOT') {
        return !this.evaluate(condition.condition);
      }
      
      // Obsługa warunków bazujących na ekwipunku
      else if (condition.type === 'HAS_ITEM') {
        return this.engine.hasItem(condition.itemId, condition.quantity || 1);
      }
      
      // Obsługa warunków bazujących na flagach
      else if (condition.type === 'FLAG') {
        const flagValue = this.engine.getFlag(condition.flagName);
        
        switch (condition.operator) {
          case '===':
            return flagValue === condition.value;
          case '!==':
            return flagValue !== condition.value;
          case '>':
            return flagValue > condition.value;
          case '>=':
            return flagValue >= condition.value;
          case '<':
            return flagValue < condition.value;
          case '<=':
            return flagValue <= condition.value;
          case 'includes':
            return Array.isArray(flagValue) && flagValue.includes(condition.value);
          default:
            // Domyślnie sprawdź czy flaga jest prawdziwa
            return !!flagValue;
        }
      }
      
      // Obsługa warunków bazujących na licznikach
      else if (condition.type === 'COUNTER') {
        const counterValue = this.engine.getCounter(condition.counterName);
        
        switch (condition.operator) {
          case '===':
            return counterValue === condition.value;
          case '!==':
            return counterValue !== condition.value;
          case '>':
            return counterValue > condition.value;
          case '>=':
            return counterValue >= condition.value;
          case '<':
            return counterValue < condition.value;
          case '<=':
            return counterValue <= condition.value;
          default:
            // Domyślnie sprawdź czy licznik jest większy od zera
            return counterValue > 0;
        }
      }
      
      // Obsługa warunków czasowych
      else if (condition.type === 'TIME_PASSED') {
        const now = Date.now();
        const timestamp = this.engine.getFlag(`__timestamp_${condition.id}`, 0);
        
        // Jeśli timestamp nie istnieje, ustaw go i zwróć false
        if (timestamp === 0) {
          this.engine.setFlag(`__timestamp_${condition.id}`, now);
          return false;
        }
        
        // Sprawdź czy minął odpowiedni czas
        const timePassed = now - timestamp;
        return timePassed >= condition.milliseconds;
      }
      
      // Obsługa warunków na podstawie liczby odwiedzin sceny
      else if (condition.type === 'VISIT_COUNT') {
        const sceneVisits = this.engine.getCounter(`__visits_${condition.sceneId}`, 0);
        
        switch (condition.operator) {
          case '===':
            return sceneVisits === condition.value;
          case '!==':
            return sceneVisits !== condition.value;
          case '>':
            return sceneVisits > condition.value;
          case '>=':
            return sceneVisits >= condition.value;
          case '<':
            return sceneVisits < condition.value;
          case '<=':
            return sceneVisits <= condition.value;
          default:
            return sceneVisits > 0;
        }
      }
      
      // Obsługa warunków kombinacji przedmiotów
      else if (condition.type === 'HAS_ITEMS_COMBINATION') {
        if (!Array.isArray(condition.items)) {
          console.error('HAS_ITEMS_COMBINATION wymaga tablicy przedmiotów!');
          return false;
        }
        
        return condition.items.every(item => 
          this.engine.hasItem(item.id, item.quantity || 1)
        );
      }
      
      // Obsługa warunku dla atrybutów postaci (jeśli gra ma system atrybutów)
      else if (condition.type === 'ATTRIBUTE') {
        const attributes = this.engine.getFlag('attributes', {});
        const attributeValue = attributes[condition.attributeName] || 0;
        
        switch (condition.operator) {
          case '===':
            return attributeValue === condition.value;
          case '!==':
            return attributeValue !== condition.value;
          case '>':
            return attributeValue > condition.value;
          case '>=':
            return attributeValue >= condition.value;
          case '<':
            return attributeValue < condition.value;
          case '<=':
            return attributeValue <= condition.value;
          default:
            return attributeValue > 0;
        }
      }
      
      // Obsługa niestandardowych warunków (używane tylko w trybie deweloperskim)
      else if (condition.type === 'CUSTOM' && condition.evaluator) {
        try {
          // UWAGA: To podejście stwarza potencjalne zagrożenie bezpieczeństwa i powinno być używane tylko przez deweloperów
          // W produkcyjnej wersji należy rozważyć bardziej bezpieczne podejście
          const customEvalFunction = new Function('engine', `
            try {
              return (${condition.evaluator})(engine);
            } catch (e) {
              console.error('Błąd w niestandardowym warunku:', e);
              return false;
            }
          `);
          
          return customEvalFunction(this.engine);
        } catch (error) {
          console.error('Błąd podczas ewaluacji niestandardowego warunku:', error);
          return false;
        }
      }
      
      // Obsługa warunku na podstawie ścieżki historii
      else if (condition.type === 'HISTORY_INCLUDES') {
        const history = this.engine.stateManager.getState('history') || [];
        return history.includes(condition.sceneId);
      }
      
      // Obsługa warunku na podstawie poprzedniej sceny
      else if (condition.type === 'PREVIOUS_SCENE') {
        const history = this.engine.stateManager.getState('history') || [];
        if (history.length === 0) return false;
        
        const previousScene = history[history.length - 1];
        return previousScene === condition.sceneId;
      }
      
      // Domyślnie zwróć true dla nieznanych typów warunków
      console.warn(`Nieznany typ warunku: ${condition.type}`);
      return true;
    }
    
    /**
     * Tworzy prosty warunek na podstawie parametrów
     * @param {string} type - Typ warunku
     * @param {Object} params - Parametry warunku
     * @returns {Object} Obiekt warunku
     */
    createCondition(type, params = {}) {
      return {
        type,
        ...params
      };
    }
    
    /**
     * Tworzy złożony warunek AND
     * @param {Array} conditions - Lista warunków do połączenia operatorem AND
     * @returns {Object} Złożony warunek
     */
    createAndCondition(conditions) {
      return {
        type: 'AND',
        conditions
      };
    }
    
    /**
     * Tworzy złożony warunek OR
     * @param {Array} conditions - Lista warunków do połączenia operatorem OR
     * @returns {Object} Złożony warunek
     */
    createOrCondition(conditions) {
      return {
        type: 'OR',
        conditions
      };
    }
    
    /**
     * Tworzy warunek negacji
     * @param {Object} condition - Warunek do zanegowania
     * @returns {Object} Zanegowany warunek
     */
    createNotCondition(condition) {
      return {
        type: 'NOT',
        condition
      };
    }
  }