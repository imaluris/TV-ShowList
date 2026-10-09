import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../firebase/config";

// Il "contenitore" del contesto: da qui i componenti leggeranno
// chi è l'utente loggato (o null se nessuno è loggato).
const AuthContext = createContext(null);

/**
 * Hook di comodo: invece di scrivere useContext(AuthContext) ovunque,
 * i componenti scriveranno semplicemente useAuth().
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Componente che avvolge tutta l'app (vedi main.jsx) e fornisce
 * lo stato di autenticazione a chiunque ne abbia bisogno, ovunque
 * si trovi nell'albero dei componenti — senza dover passare "user"
 * come prop attraverso ogni livello.
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // true finché Firebase non ha risposto la prima volta

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Ricarica i dati dell'utente da Firebase (es. dopo che ha confermato
  // l'email) e forza React ad accorgersene, creando un oggetto NUOVO
  // con { ...auth.currentUser } invece di riusare lo stesso oggetto.
  // useCallback: la funzione resta la stessa tra un render e l'altro, così
  // può stare tra le dipendenze di un useEffect senza farlo ripartire.
  const refreshCurrentUser = useCallback(async () => {
    await reload(auth.currentUser);
    setCurrentUser({ ...auth.currentUser });
  }, []);

  const value = {
    currentUser,
    refreshCurrentUser,
  };

  // Finché non sappiamo ancora se l'utente è loggato o no, non mostriamo
  // nulla (o uno spinner) — evita "flash" di contenuto sbagliato
  // (es. mostrare la pagina di login per un istante a chi è già loggato).
  if (loading) {
    return <p>Caricamento...</p>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}