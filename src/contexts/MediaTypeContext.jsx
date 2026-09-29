import { createContext, useContext, useState } from "react";

// Il "contenitore" del contesto: da qui i componenti leggeranno se stiamo
// navigando tra serie TV o film. Il valore è letteralmente "tv" o "movie",
// così da usarlo direttamente negli URL delle chiamate a TMDB (vedi tmdb.js).
const MediaTypeContext = createContext(null);

const STORAGE_KEY = "mediaType";

/**
 * Hook di comodo: invece di scrivere useContext(MediaTypeContext) ovunque,
 * i componenti scriveranno semplicemente useMediaType().
 */
export function useMediaType() {
  return useContext(MediaTypeContext);
}

/**
 * Componente che avvolge l'app (vedi main.jsx) e fornisce lo stato
 * mediaType + il modo per cambiarlo a chiunque ne abbia bisogno.
 */
export function MediaTypeProvider({ children }) {
  const [mediaType, setMediaTypeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "movie" ? "movie" : "tv"; // "tv" di default
  });

  function setMediaType(newType) {
    setMediaTypeState(newType);
    localStorage.setItem(STORAGE_KEY, newType);
  }

  const value = {
    mediaType,
    setMediaType,
    isMovie: mediaType === "movie",
  };

  return (
    <MediaTypeContext.Provider value={value}>
      {children}
    </MediaTypeContext.Provider>
  );
}