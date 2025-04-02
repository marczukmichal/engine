import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook do automatycznego zapisywania stanu
 * @param {Object} data - Dane do zapisania
 * @param {number} delay - Opóźnienie w milisekundach przed zapisem
 * @returns {Object} Obiekt z informacjami o ostatnim zapisie i funkcją zapisującą
 */
const useAutoSave = (data, delay = 2000) => {
  // Stan ostatniego zapisu
  const [lastSaved, setLastSaved] = useState(null);
  
  // Referencja do aktualnych danych (unikamy wyzwalania efektu przy każdej zmianie)
  const dataRef = useRef(data);
  dataRef.current = data;
  
  // Timer zapisu
  const saveTimerRef = useRef(null);
  
  /**
   * Funkcja zapisująca dane do localStorage
   */
  const saveProject = useCallback(() => {
    try {
      const projectData = JSON.stringify(dataRef.current);
      localStorage.setItem('lastProject', projectData);
      
      // Aktualizuj czas ostatniego zapisu
      setLastSaved(new Date());
      
      console.log('Projekt zapisany pomyślnie', new Date().toLocaleTimeString());
      
      // Opcjonalnie: zapisz informacje o projekcie w indeksie projektów
      const projectsIndex = localStorage.getItem('projectsIndex');
      let projects = projectsIndex ? JSON.parse(projectsIndex) : [];
      
      // Sprawdź czy projekt już istnieje w indeksie
      const projectExists = projects.some(p => p.id === dataRef.current.id);
      
      if (projectExists) {
        // Aktualizuj is