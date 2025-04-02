import { useState, useCallback } from 'react';

/**
 * Hook do zarządzania historią zmian i funkcjami undo/redo
 * @param {Object} initialState - Początkowy stan
 * @param {number} maxHistoryLength - Maksymalna długość historii
 * @returns {Object} Obiekt z funkcjami i stanem historii
 */
const useUndoRedo = (initialState, maxHistoryLength = 50) => {
  // Historia stanów do cofania (undo)
  const [history, setHistory] = useState([]);
  
  // Historia stanów do ponawiania (redo)
  const [redoStack, setRedoStack] = useState([]);
  
  /**
   * Dodaj stan do historii
   * @param {Object} state - Stan do zapisania w historii
   */
  const addToHistory = useCallback((state) => {
    setHistory(prev => {
      // Ogranicz długość historii
      const newHistory = [...prev, JSON.parse(JSON.stringify(state))];
      if (newHistory.length > maxHistoryLength) {
        newHistory.shift();
      }
      return newHistory;
    });
    
    // Wyczyść stos redo po dodaniu nowego stanu
    setRedoStack([]);
  }, [maxHistoryLength]);
  
  /**
   * Cofnij ostatnią zmianę
   * @returns {Object|null} Poprzedni stan lub null jeśli historia jest pusta
   */
  const undo = useCallback(() => {
    if (history.length === 0) return null;
    
    // Pobierz ostatni stan z historii
    const prevState = history[history.length - 1];
    
    // Zaktualizuj historię
    setHistory(prev => prev.slice(0, -1));
    
    // Dodaj bieżący stan do stosu redo
    setRedoStack(prev => [...prev, initialState]);
    
    return prevState;
  }, [history, initialState]);
  
  /**
   * Ponów cofniętą zmianę
   * @returns {Object|null} Następny stan lub null jeśli stos redo jest pusty
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return null;
    
    // Pobierz ostatni stan ze stosu redo
    const nextState = redoStack[redoStack.length - 1];
    
    // Zaktualizuj stos redo
    setRedoStack(prev => prev.slice(0, -1));
    
    // Dodaj bieżący stan do historii
    setHistory(prev => [...prev, initialState]);
    
    return nextState;
  }, [redoStack, initialState]);
  
  /**
   * Wyczyść historię
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
  }, []);
  
  return {
    addToHistory,
    undo,
    redo,
    clearHistory,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    historyLength: history.length,
    redoLength: redoStack.length
  };
};

export default useUndoRedo;