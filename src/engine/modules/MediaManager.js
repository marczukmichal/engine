/**
 * Klasa obsługująca zarządzanie multimediami
 */
export class MediaManager {
    /**
     * Inicjalizacja menedżera multimediów
     * @param {Object} resources - Zasoby multimedialne
     */
    constructor(resources = {}) {
      this.resources = resources;
      this.cache = {
        images: {},
        audio: {},
        video: {}
      };
      
      // Śledzenie aktualnie odtwarzanych mediów
      this.playingAudio = new Map();
      this.playingVideo = new Map();
      
      // Preload zasobów oznaczonych do wstępnego ładowania
      this.preloadResources();
    }
    
    /**
     * Wstępne ładowanie zasobów oznaczonych do preloadingu
     * @private
     */
    preloadResources() {
      // Preload obrazów
      if (this.resources.images) {
        Object.entries(this.resources.images)
          .filter(([, resource]) => resource.preload)
          .forEach(([id]) => {
            this.loadImage(id).catch(error => {
              console.warn(`Nie udało się wstępnie załadować obrazu "${id}":`, error);
            });
          });
      }
      
      // Preload dźwięków
      if (this.resources.audio) {
        Object.entries(this.resources.audio)
          .filter(([, resource]) => resource.preload)
          .forEach(([id]) => {
            this.loadAudio(id).catch(error => {
              console.warn(`Nie udało się wstępnie załadować dźwięku "${id}":`, error);
            });
          });
      }
    }
    
    /**
     * Załaduj obraz
     * @param {string} imageId - Identyfikator obrazu
     * @returns {Promise<HTMLImageElement>} Obietnica załadowanego obrazu
     */
    loadImage(imageId) {
      // Sprawdź czy obraz jest już w cache
      if (this.cache.images[imageId]) {
        return Promise.resolve(this.cache.images[imageId]);
      }
      
      // Sprawdź czy obraz jest zdefiniowany w zasobach
      if (!this.resources.images || !this.resources.images[imageId]) {
        return Promise.reject(new Error(`Obraz "${imageId}" nie istnieje!`));
      }
      
      const resource = this.resources.images[imageId];
      const src = typeof resource === 'string' ? resource : resource.src;
      
      if (!src) {
        return Promise.reject(new Error(`Nieprawidłowy format zasobu obrazu "${imageId}"!`));
      }
      
      // Załaduj obraz
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.cache.images[imageId] = img;
          resolve(img);
        };
        img.onerror = () => {
          reject(new Error(`Nie udało się załadować obrazu "${imageId}" z adresu "${src}"!`));
        };
        img.src = src;
      });
    }
    
    /**
     * Załaduj dźwięk
     * @param {string} audioId - Identyfikator dźwięku
     * @returns {Promise<HTMLAudioElement>} Obietnica załadowanego dźwięku
     */
    loadAudio(audioId) {
      // Sprawdź czy dźwięk jest już w cache
      if (this.cache.audio[audioId]) {
        return Promise.resolve(this.cache.audio[audioId]);
      }
      
      // Sprawdź czy dźwięk jest zdefiniowany w zasobach
      if (!this.resources.audio || !this.resources.audio[audioId]) {
        return Promise.reject(new Error(`Dźwięk "${audioId}" nie istnieje!`));
      }
      
      const resource = this.resources.audio[audioId];
      const src = typeof resource === 'string' ? resource : resource.src;
      
      if (!src) {
        return Promise.reject(new Error(`Nieprawidłowy format zasobu dźwięku "${audioId}"!`));
      }
      
      // Załaduj dźwięk
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        
        // Obsługa różnych formatów dźwięku
        if (typeof resource === 'object' && resource.alternativeSources) {
          for (const altSrc of resource.alternativeSources) {
            const source = document.createElement('source');
            source.src = altSrc.src;
            source.type = altSrc.type;
            audio.appendChild(source);
          }
        }
        
        audio.oncanplaythrough = () => {
          this.cache.audio[audioId] = audio;
          resolve(audio);
        };
        audio.onerror = () => {
          reject(new Error(`Nie udało się załadować dźwięku "${audioId}" z adresu "${src}"!`));
        };
        
        if (typeof resource === 'object' && resource.alternativeSources) {
          // Jeśli dodaliśmy źródła alternatywne, główne źródło nie jest potrzebne
          audio.load();
        } else {
          audio.src = src;
        }
      });
    }
    
    /**
     * Załaduj wideo
     * @param {string} videoId - Identyfikator wideo
     * @returns {Promise<HTMLVideoElement>} Obietnica załadowanego wideo
     */
    loadVideo(videoId) {
      // Sprawdź czy wideo jest już w cache
      if (this.cache.video[videoId]) {
        return Promise.resolve(this.cache.video[videoId]);
      }
      
      // Sprawdź czy wideo jest zdefiniowane w zasobach
      if (!this.resources.video || !this.resources.video[videoId]) {
        return Promise.reject(new Error(`Wideo "${videoId}" nie istnieje!`));
      }
      
      const resource = this.resources.video[videoId];
      const src = typeof resource === 'string' ? resource : resource.src;
      
      if (!src) {
        return Promise.reject(new Error(`Nieprawidłowy format zasobu wideo "${videoId}"!`));
      }
      
      // Załaduj wideo
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        
        // Obsługa różnych formatów wideo
        if (typeof resource === 'object' && resource.alternativeSources) {
          for (const altSrc of resource.alternativeSources) {
            const source = document.createElement('source');
            source.src = altSrc.src;
            source.type = altSrc.type;
            video.appendChild(source);
          }
        }
        
        video.oncanplaythrough = () => {
          this.cache.video[videoId] = video;
          resolve(video);
        };
        video.onerror = () => {
          reject(new Error(`Nie udało się załadować wideo "${videoId}" z adresu "${src}"!`));
        };
        
        if (typeof resource === 'object' && resource.alternativeSources) {
          // Jeśli dodaliśmy źródła alternatywne, główne źródło nie jest potrzebne
          video.load();
        } else {
          video.src = src;
        }
      });
    }
    
    /**
     * Odtwórz dźwięk
     * @param {string} audioId - Identyfikator dźwięku
     * @param {Object} options - Opcje odtwarzania
     * @returns {Promise<HTMLAudioElement>} Obietnica odtwarzanego dźwięku
     */
    playAudio(audioId, options = {}) {
      return this.loadAudio(audioId)
        .then(audio => {
          // Jeśli dźwięk jest już odtwarzany, zatrzymaj go
          if (this.playingAudio.has(audioId)) {
            const currentAudio = this.playingAudio.get(audioId);
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }
          
          // Sklonuj element audio, aby umożliwić odtwarzanie wielu instancji jednocześnie
          const audioClone = options.clone ? audio.cloneNode(true) : audio;
          
          // Ustaw parametry odtwarzania
          audioClone.volume = options.volume !== undefined ? options.volume : 1;
          audioClone.loop = !!options.loop;
          audioClone.playbackRate = options.speed !== undefined ? options.speed : 1;
          audioClone.currentTime = options.startTime || 0;
          
          // Dodaj obsługę zakończenia odtwarzania
          const onEnded = () => {
            if (options.onEnded) options.onEnded();
            if (!options.loop) this.playingAudio.delete(audioId);
            audioClone.removeEventListener('ended', onEnded);
          };
          
          audioClone.addEventListener('ended', onEnded);
          
          // Rozpocznij odtwarzanie
          const playPromise = audioClone.play();
          
          // Obsłuż potencjalne błędy odtwarzania (np. autoplay policy)
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error(`Błąd podczas odtwarzania dźwięku "${audioId}":`, error);
              this.playingAudio.delete(audioId);
              if (options.onError) options.onError(error);
            });
          }
          
          // Dodaj do listy odtwarzanych dźwięków
          this.playingAudio.set(audioId, audioClone);
          
          return audioClone;
        });
    }
    
    /**
     * Zatrzymaj odtwarzanie dźwięku
     * @param {string} audioId - Identyfikator dźwięku
     * @returns {boolean} Czy zatrzymanie się powiodło
     */
    stopAudio(audioId) {
      if (this.playingAudio.has(audioId)) {
        const audio = this.playingAudio.get(audioId);
        audio.pause();
        audio.currentTime = 0;
        this.playingAudio.delete(audioId);
        return true;
      }
      return false;
    }
    
    /**
     * Zatrzymaj wszystkie odtwarzane dźwięki
     */
    stopAllAudio() {
      this.playingAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      this.playingAudio.clear();
    }
    
    /**
     * Odtwórz wideo
     * @param {string} videoId - Identyfikator wideo
     * @param {Object} options - Opcje odtwarzania
     * @returns {Promise<HTMLVideoElement>} Obietnica odtwarzanego wideo
     */
    playVideo(videoId, options = {}) {
      return this.loadVideo(videoId)
        .then(video => {
          // Jeśli wideo jest już odtwarzane, zatrzymaj je
          if (this.playingVideo.has(videoId)) {
            const currentVideo = this.playingVideo.get(videoId);
            currentVideo.pause();
            currentVideo.currentTime = 0;
          }
          
          // Ustaw parametry odtwarzania
          video.volume = options.volume !== undefined ? options.volume : 1;
          video.loop = !!options.loop;
          video.playbackRate = options.speed !== undefined ? options.speed : 1;
          video.currentTime = options.startTime || 0;
          video.muted = !!options.muted;
          
          if (options.width) video.width = options.width;
          if (options.height) video.height = options.height;
          
          // Dodaj obsługę zakończenia odtwarzania
          const onEnded = () => {
            if (options.onEnded) options.onEnded();
            if (!options.loop) this.playingVideo.delete(videoId);
            video.removeEventListener('ended', onEnded);
          };
          
          video.addEventListener('ended', onEnded);
          
          // Rozpocznij odtwarzanie
          const playPromise = video.play();
          
          // Obsłuż potencjalne błędy odtwarzania (np. autoplay policy)
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error(`Błąd podczas odtwarzania wideo "${videoId}":`, error);
              this.playingVideo.delete(videoId);
              if (options.onError) options.onError(error);
            });
          }
          
          // Dodaj do listy odtwarzanych wideo
          this.playingVideo.set(videoId, video);
          
          return video;
        });
    }
    
    /**
     * Zatrzymaj odtwarzanie wideo
     * @param {string} videoId - Identyfikator wideo
     * @returns {boolean} Czy zatrzymanie się powiodło
     */
    stopVideo(videoId) {
      if (this.playingVideo.has(videoId)) {
        const video = this.playingVideo.get(videoId);
        video.pause();
        video.currentTime = 0;
        this.playingVideo.delete(videoId);
        return true;
      }
      return false;
    }
    
    /**
     * Zatrzymaj wszystkie odtwarzane wideo
     */
    stopAllVideo() {
      this.playingVideo.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
      this.playingVideo.clear();
    }
    
    /**
     * Dodaj nowy zasób
     * @param {string} type - Typ zasobu ('image', 'audio', 'video')
     * @param {string} id - Identyfikator zasobu
     * @param {string|Object} resource - Adres URL zasobu lub obiekt z konfiguracją
     */
    addResource(type, id, resource) {
      const resourceType = type + 's'; // images, audios, videos
      
      if (!this.resources[resourceType]) {
        this.resources[resourceType] = {};
      }
      
      this.resources[resourceType][id] = resource;
      
      // Wyczyść cache dla tego zasobu
      if (this.cache[resourceType][id]) {
        delete this.cache[resourceType][id];
      }
    }
    
    /**
     * Usuń zasób
     * @param {string} type - Typ zasobu ('image', 'audio', 'video')
     * @param {string} id - Identyfikator zasobu
     */
    removeResource(type, id) {
      const resourceType = type + 's'; // images, audios, videos
      
      if (this.resources[resourceType] && this.resources[resourceType][id]) {
        delete this.resources[resourceType][id];
      }
      
      // Wyczyść cache dla tego zasobu
      if (this.cache[resourceType][id]) {
        delete this.cache[resourceType][id];
      }
      
      // Zatrzymaj odtwarzanie jeśli to audio lub wideo
      if (type === 'audio') {
        this.stopAudio(id);
      } else if (type === 'video') {
        this.stopVideo(id);
      }
    }
    
    /**
     * Wyczyść całą pamięć podręczną
     */
    clearCache() {
      this.cache = {
        images: {},
        audio: {},
        video: {}
      };
    }
  }