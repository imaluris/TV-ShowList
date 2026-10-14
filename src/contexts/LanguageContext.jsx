import { createContext, Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  getContentLanguage,
  setContentLanguage,
  LANGUAGES,
} from "../services/language";
import { getPreferredLanguage, setPreferredLanguage } from "../services/profile";

const LanguageContext = createContext(null);

// Tiene la lingua dei contenuti: la legge da Firestore quando l'utente è
// loggato e la salva quando la cambia. Quando la lingua cambia, i figli
// vengono rimontati (key={language}): tutte le pagine rifanno le chiamate
// a TMDB nella nuova lingua, senza dover ricaricare la pagina a mano.
export function LanguageProvider({ children }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const [language, setLanguageState] = useState(getContentLanguage);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    getPreferredLanguage(uid)
      .then((saved) => {
        if (cancelled || !saved || saved === getContentLanguage()) return;
        if (!LANGUAGES.some((lang) => lang.value === saved)) return;
        setContentLanguage(saved);
        setLanguageState(saved);
      })
      .catch((error) => console.error("Lingua non caricata:", error));

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const changeLanguage = useCallback(
    async (value) => {
      setContentLanguage(value);
      setLanguageState(value);
      if (uid) {
        await setPreferredLanguage(uid, value);
      }
    },
    [uid],
  );

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <Fragment key={language}>{children}</Fragment>
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage va usato dentro un LanguageProvider");
  }
  return context;
}
