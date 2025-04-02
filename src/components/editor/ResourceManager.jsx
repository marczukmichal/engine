import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaTrash, FaEdit, FaPlay, FaPause, FaImage, FaMusic, FaVideo, FaFolderOpen } from 'react-icons/fa';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Tabs from '../common/Tabs';

/**
 * Komponent zarządzania zasobami gry
 */
const ResourceManager = ({ resources, onUpdateResources }) => {
  // Stan lokalny
  const [activeTab, setActiveTab] = useState('images');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newResource, setNewResource] = useState({
    id: '',
    src: '',
    type: 'image',
    preload: false,
    description: ''
  });
  
  // Referencje do elementów audio i wideo
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  
  // Mapowanie typu zasobu na kolekcję
  const resourceCollections = {
    image: 'images',
    audio: 'audio',
    video: 'video'
  };
  
  // Obsługa zmiany pola formularza
  const handleFieldChange = (field, value) => {
    setNewResource(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Obsługa dodawania nowego zasobu
  const handleAddResource = () => {
    // Sprawdź czy pola formularza są wypełnione
    if (!newResource.id || !newResource.src) {
      alert('ID i adres URL są wymagane!');
      return;
    }
    
    // Sprawdź czy ID jest unikalne
    const collection = resourceCollections[newResource.type];
    if (resources[collection] && resources[collection][newResource.id]) {
      alert(`Zasób o ID "${newResource.id}" już istnieje!`);
      return;
    }
    
    // Dodaj nowy zasób
    const updatedResources = {
      ...resources,
      [collection]: {
        ...resources[collection],
        [newResource.id]: {
          src: newResource.src,
          preload: newResource.preload,
          description: newResource.description
        }
      }
    };
    
    // Aktualizuj zasoby
    onUpdateResources(updatedResources);
    
    // Zresetuj formularz i zamknij modal
    setNewResource({
      id: '',
      src: '',
      type: 'image',
      preload: false,
      description: ''
    });
    setShowAddModal(false);
  };
  
  // Obsługa usuwania zasobu
  const handleDeleteResource = (resourceType, resourceId) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć zasób "${resourceId}"?`)) {
      return;
    }
    
    const collection = resourceCollections[resourceType] || resourceType + 's';
    const updatedCollection = { ...resources[collection] };
    delete updatedCollection[resourceId];
    
    const updatedResources = {
      ...resources,
      [collection]: updatedCollection
    };
    
    onUpdateResources(updatedResources);
  };
  
  // Obsługa podglądu zasobu
  const handlePreviewResource = (resourceType, resourceId) => {
    const collection = resourceCollections[resourceType] || resourceType + 's';
    const resource = resources[collection][resourceId];
    
    setCurrentResource({
      id: resourceId,
      ...resource,
      type: resourceType
    });
    
    setShowPreviewModal(true);
    setIsPlaying(false);
  };
  
  // Obsługa odtwarzania audio/wideo
  const handlePlayPause = () => {
    if (currentResource.type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (currentResource.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Renderowanie listy zasobów
  const renderResourceList = (resourceType) => {
    const collection = resourceCollections[resourceType] || resourceType;
    const resourceList = resources[collection] || {};
    
    if (Object.keys(resourceList).length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">Brak zasobów. Dodaj pierwszy!</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(resourceList).map(([id, resource]) => (
          <div 
            key={id} 
            className="border rounded p-4 bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{id}</h3>
                <p className="text-sm text-gray-500 truncate dark:text-gray-400">{resource.src}</p>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePreviewResource(resourceType === 'images' ? 'image' : resourceType === 'audio' ? 'audio' : 'video', id)}
                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Podgląd"
                >
                  {resourceType === 'images' ? <FaImage /> : resourceType === 'audio' ? <FaPlay /> : <FaVideo />}
                </button>
                <button
                  onClick={() => handleDeleteResource(resourceType === 'images' ? 'image' : resourceType === 'audio' ? 'audio' : 'video', id)}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Usuń"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {resource.preload && <span className="mr-2 bg-blue-100 text-blue-800 px-1 rounded dark:bg-blue-900 dark:text-blue-300">Preload</span>}
              {resource.description && <span className="italic">{resource.description}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Menedżer zasobów</h2>
        <Button
          label="Dodaj zasób"
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={<FaPlus />}
        />
      </div>
      
      <Tabs
        tabs={[
          { id: 'images', label: 'Obrazy', icon: <FaImage className="mr-1" /> },
          { id: 'audio', label: 'Dźwięki', icon: <FaMusic className="mr-1" /> },
          { id: 'video', label: 'Wideo', icon: <FaVideo className="mr-1" /> }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 overflow-y-auto p-2">
        {renderResourceList(activeTab)}
      </div>
      
      {/* Modal dodawania zasobu */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Dodaj nowy zasób"
        size="medium"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Typ zasobu:
            </label>
            <select
              value={newResource.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="image">Obraz</option>
              <option value="audio">Dźwięk</option>
              <option value="video">Wideo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              ID zasobu:
            </label>
            <input
              type="text"
              value={newResource.id}
              onChange={(e) => handleFieldChange('id', e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="np. background_image_1"
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Unikalny identyfikator używany w kodzie gry
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              URL zasobu:
            </label>
            <div className="flex">
              <input
                type="text"
                value={newResource.src}
                onChange={(e) => handleFieldChange('src', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-l dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
              <button
                className="px-3 py-2 bg-blue-100 border border-l-0 rounded-r text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:border-blue-700 dark:text-blue-200"
                title="Przeglądaj pliki"
              >
                <FaFolderOpen />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Adres URL do zasobu (lokalny lub zewnętrzny)
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="preload-checkbox"
              checked={newResource.preload}
              onChange={(e) => handleFieldChange('preload', e.target.checked)}
              className="mr-2 dark:bg-gray-700"
            />
            <label htmlFor="preload-checkbox" className="text-sm dark:text-gray-300">
              Wczytaj wstępnie (preload)
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Opis (opcjonalnie):
            </label>
            <textarea
              value={newResource.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Krótki opis zasobu"
              rows="2"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              label="Anuluj"
              onClick={() => setShowAddModal(false)}
              variant="secondary"
            />
            <Button
              label="Dodaj"
              onClick={handleAddResource}
              variant="primary"
            />
          </div>
        </div>
      </Modal>
      
      {/* Modal podglądu zasobu */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Podgląd: ${currentResource?.id || ''}`}
        size={currentResource?.type === 'video' ? 'large' : 'medium'}
      >
        {currentResource && (
          <div className="space-y-4">
            {currentResource.type === 'image' && (
              <div className="flex justify-center">
                <img 
                  src={currentResource.src} 
                  alt={currentResource.id}
                  className="max-w-full max-h-96 object-contain border rounded" 
                />
              </div>
            )}
            
            {currentResource.type === 'audio' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    label={isPlaying ? "Pauza" : "Odtwórz"}
                    onClick={handlePlayPause}
                    variant="primary"
                    icon={isPlaying ? <FaPause /> : <FaPlay />}
                  />
                </div>
                <audio 
                  ref={audioRef} 
                  src={currentResource.src}
                  className="w-full" 
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
            
            {currentResource.type === 'video' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <video 
                    ref={videoRef} 
                    src={currentResource.src}
                    className="max-w-full max-h-96 border rounded" 
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 p-3 rounded dark:bg-gray-800">
              <h3 className="font-medium mb-2 dark:text-gray-300">Informacje o zasobie:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500 dark:text-gray-400">ID:</div>
                <div className="dark:text-gray-300">{currentResource.id}</div>
                
                <div className="text-gray-500 dark:text-gray-400">URL:</div>
                <div className="break-all dark:text-gray-300">{currentResource.src}</div>
                
                <div className="text-gray-500 dark:text-gray-400">Typ:</div>
                <div className="dark:text-gray-300">{currentResource.type}</div>
                
                <div className="text-gray-500 dark:text-gray-400">Preload:</div>
                <div className="dark:text-gray-300">{currentResource.preload ? 'Tak' : 'Nie'}</div>
                
                {currentResource.description && (
                  <>
                    <div className="text-gray-500 dark:text-gray-400">Opis:</div>
                    <div className="dark:text-gray-300">{currentResource.description}</div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                label="Zamknij"
                onClick={() => setShowPreviewModal(false)}
                variant="primary"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

ResourceManager.propTypes = {
  resources: PropTypes.shape({
    images: PropTypes.object,
    audio: PropTypes.object,
    video: PropTypes.object
  }).isRequired,
  onUpdateResources: PropTypes.func.isRequired
};

export default ResourceManager;