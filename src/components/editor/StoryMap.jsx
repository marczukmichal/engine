import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaHome } from 'react-icons/fa';

/**
 * Komponent mapy historii pokazujący połączenia między scenami
 */
const StoryMap = ({ scenes, startScene, onSelectScene }) => {
  // Referencje do elementów DOM
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Stan lokalny
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scenePositions, setScenePositions] = useState({});
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Generowanie pozycji scen przy inicjalizacji
  useEffect(() => {
    const positions = {};
    const scenesArray = Object.keys(scenes);
    
    // Funkcja do uproszczonego generowania pozycji w układzie grafu
    const generatePositions = () => {
      // Poziomy grafu (każda scena ma swoją głębokość)
      const levels = {};
      const visited = new Set();
      
      // Oblicz poziom dla każdej sceny (odległość od sceny startowej)
      const calculateLevels = (sceneId, level = 0) => {
        if (visited.has(sceneId)) return;
        visited.add(sceneId);
        
        if (!levels[level]) levels[level] = [];
        levels[level].push(sceneId);
        
        // Przejdź do następnych scen
        const scene = scenes[sceneId];
        if (scene && scene.choices) {
          scene.choices.forEach(choice => {
            if (choice.nextScene && scenes[choice.nextScene]) {
              calculateLevels(choice.nextScene, level + 1);
            }
          });
        }
      };
      
      // Rozpocznij od sceny startowej
      if (startScene && scenes[startScene]) {
        calculateLevels(startScene);
      }
      
      // Dodaj pozostałe sceny, które nie są połączone ze sceną startową
      scenesArray.forEach(sceneId => {
        if (!visited.has(sceneId)) {
          calculateLevels(sceneId, Object.keys(levels).length);
        }
      });
      
      // Przypisz pozycje na podstawie poziomów
      const nodeSpacing = 180;
      const levelSpacing = 250;
      
      Object.entries(levels).forEach(([level, scenesInLevel]) => {
        const levelWidth = scenesInLevel.length * nodeSpacing;
        const startX = -levelWidth / 2 + nodeSpacing / 2;
        
        scenesInLevel.forEach((sceneId, index) => {
          positions[sceneId] = {
            x: startX + index * nodeSpacing,
            y: level * levelSpacing
          };
        });
      });
    };
    
    // Wygeneruj pozycje jeśli mamy sceny
    if (scenesArray.length > 0) {
      generatePositions();
      
      // Dodaj losowe przesunięcie dla bardziej naturalnego wyglądu
      scenesArray.forEach(sceneId => {
        if (positions[sceneId]) {
          positions[sceneId] = {
            x: positions[sceneId].x + (Math.random() * 40 - 20),
            y: positions[sceneId].y + (Math.random() * 40 - 20)
          };
        } else {
          // Jeśli z jakiegoś powodu scena nie ma pozycji, umieść ją losowo
          positions[sceneId] = {
            x: Math.random() * 1000 - 500,
            y: Math.random() * 1000 - 500
          };
        }
      });
      
      setScenePositions(positions);
      
      // Jeśli mamy scenę startową, wycentruj ją
      if (startScene && positions[startScene]) {
        setPosition({
          x: -positions[startScene].x,
          y: -positions[startScene].y + 100 // Dodaj trochę przestrzeni u góry
        });
      }
    }
  }, [scenes, startScene]);
  
  // Efekt wyszukiwania scen
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = Object.entries(scenes)
      .filter(([id, scene]) => {
        return (
          id.toLowerCase().includes(query) ||
          scene.title.toLowerCase().includes(query) ||
          (scene.content && scene.content.toLowerCase().includes(query))
        );
      })
      .map(([id]) => id);
    
    setSearchResults(results);
  }, [searchQuery, scenes]);
  
  // Obsługa wciśnięcia przycisku myszy do przeciągania
  const handleMouseDown = (e) => {
    // Tylko lewy przycisk myszy (0)
    if (e.button !== 0) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  // Obsługa ruchu myszy podczas przeciągania
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  // Obsługa zwolnienia przycisku myszy
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Obsługa kółka myszy do zoomowania
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Współczynnik zmiany przybliżenia
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.3, Math.min(2, zoom + delta));
    
    // Dostosuj pozycję, aby przybliżenie było względem kursora
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const oldZoomFactor = zoom;
      const newZoomFactor = newZoom;
      
      // Oblicz nową pozycję
      const newPosition = {
        x: position.x - ((mouseX - position.x) * (newZoomFactor - oldZoomFactor)) / oldZoomFactor,
        y: position.y - ((mouseY - position.y) * (newZoomFactor - oldZoomFactor)) / oldZoomFactor
      };
      
      setPosition(newPosition);
    }
    
    setZoom(newZoom);
  };
  
  // Oblicz pozycje węzłów i krawędzi
  const generateNodes = () => {
    const nodes = [];
    const edges = [];
    
    // Dodaj węzły (sceny)
    Object.entries(scenes).forEach(([sceneId, scene]) => {
      const pos = scenePositions[sceneId];
      if (!pos) return;
      
      // Wygląd węzła zależy od statusu
      const isStartNode = sceneId === startScene;
      const isHighlighted = searchResults.includes(sceneId);
      const isInHighlightedPath = highlightedPath && (
        highlightedPath.sourceId === sceneId || highlightedPath.targetId === sceneId
      );
      
      // Dodaj węzeł
      nodes.push(
        <g
          key={`node-${sceneId}`}
          transform={`translate(${pos.x}, ${pos.y})`}
          className="cursor-pointer"
          onClick={() => onSelectScene(sceneId)}
          onMouseEnter={() => highlightConnections(sceneId)}
          onMouseLeave={() => setHighlightedPath(null)}
        >
          {/* Tło węzła */}
          <rect
            x="-75"
            y="-30"
            width="150"
            height="60"
            rx="10"
            className={`
              ${isStartNode ? 'fill-green-100 stroke-green-500' : 'fill-blue-50 stroke-blue-300'} 
              ${isHighlighted ? 'stroke-yellow-400 stroke-[3px]' : ''}
              ${isInHighlightedPath ? 'stroke-purple-500 stroke-[3px]' : ''}
              dark:fill-opacity-90
              stroke-2 shadow-md
            `}
          />
          
          {/* Tytuł sceny */}
          <text
            y="-10"
            className="text-sm font-medium text-center dark:fill-white"
            textAnchor="middle"
          >
            {scene.title.length > 20 ? scene.title.substring(0, 17) + '...' : scene.title}
          </text>
          
          {/* ID sceny */}
          <text
            y="10"
            className="text-xs text-gray-500 dark:fill-gray-300"
            textAnchor="middle"
          >
            ID: {sceneId}
          </text>
          
          {/* Wskaźnik sceny startowej */}
          {isStartNode && (
            <circle
              cx="65"
              cy="-20"
              r="8"
              className="fill-green-500"
            />
          )}
        </g>
      );
      
      // Dodaj krawędzie (połączenia) do innych scen
      if (scene.choices) {
        scene.choices.forEach(choice => {
          if (choice.nextScene && scenePositions[choice.nextScene]) {
            const targetPos = scenePositions[choice.nextScene];
            
            // Oblicz punkty dla krzywej Beziera
            const dx = targetPos.x - pos.x;
            const dy = targetPos.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Zakrzywienie linii
            const controlPointOffset = Math.min(distance / 2, 100);
            
            // Punkty końcowe (skorygowane, aby linie zaczynały się i kończyły na krawędziach węzłów)
            const sourceOffsetX = dx === 0 ? 0 : (dx > 0 ? 75 : -75);
            const sourceOffsetY = dy === 0 ? 0 : (Math.abs(dx) < Math.abs(dy) ? (dy > 0 ? 30 : -30) : 0);
            const targetOffsetX = dx === 0 ? 0 : (dx > 0 ? -75 : 75);
            const targetOffsetY = dy === 0 ? 0 : (Math.abs(dx) < Math.abs(dy) ? (dy > 0 ? -30 : 30) : 0);
            
            const sourceX = pos.x + sourceOffsetX;
            const sourceY = pos.y + sourceOffsetY;
            const targetX = targetPos.x + targetOffsetX;
            const targetY = targetPos.y + targetOffsetY;
            
            // Punkty kontrolne dla krzywej Beziera
            const controlPoint1X = sourceX + dx / 8;
            const controlPoint1Y = sourceY + dy / 2;
            const controlPoint2X = targetX - dx / 8;
            const controlPoint2Y = targetY - dy / 2;
            
            // Sprawdź, czy to jest podświetlona ścieżka
            const isPathHighlighted = highlightedPath && 
              highlightedPath.sourceId === sceneId && 
              highlightedPath.targetId === choice.nextScene;
            
            // Ścieżka dla krzywej
            const pathData = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
            
            // Dodaj krawędź
            edges.push(
              <g key={`edge-${sceneId}-${choice.nextScene}-${Math.random()}`}>
                <path
                  d={pathData}
                  className={`
                    fill-none 
                    ${isPathHighlighted ? 'stroke-purple-500 stroke-[3px]' : 'stroke-gray-300 dark:stroke-gray-600'} 
                    ${choice.condition ? 'stroke-dashed' : ''}
                  `}
                  markerEnd="url(#arrowhead)"
                  onMouseEnter={() => setHighlightedPath({ sourceId: sceneId, targetId: choice.nextScene })}
                  onMouseLeave={() => setHighlightedPath(null)}
                />
                
                {/* Opcjonalnie: etykieta dla krawędzi */}
                {choice.text && choice.text.length < 20 && (
                  <text>
                    <textPath
                      href={`#edge-${sceneId}-${choice.nextScene}`}
                      startOffset="50%"
                      className="text-xs fill-gray-500 dark:fill-gray-400"
                      textAnchor="middle"
                    >
                      {choice.text.substring(0, 15) + (choice.text.length > 15 ? '...' : '')}
                    </textPath>
                  </text>
                )}
              </g>
            );
          }
        });
      }
    });
    
    return { nodes, edges };
  };