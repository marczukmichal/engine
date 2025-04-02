import React, { createContext, useContext } from 'react';

// Utworzenie kontekstu edytora
const EditorContext = createContext({
  projectData: null,
  setProjectData: () => {},
  selectedSceneId: null,
  setSelectedSceneId: () => {},
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  lastSaved: null
});

// Hook do łatwego użycia kontekstu
export const useEditor = () => useContext(EditorContext);

// Provider do udostępniania kontekstu
export const EditorContextProvider = ({ children, value }) => {
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContext;