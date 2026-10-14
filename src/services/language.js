// Lingua dei CONTENUTI (titoli, trame, biografie...): è quella che
// chiediamo a TMDB. L'interfaccia dell'app resta sempre in inglese.
//
// Il valore corrente vive in questa variabile di modulo, così tmdb.js
// può leggerlo senza che ogni funzione debba riceverlo come parametro.
// La scelta è salvata su Firestore (vedi profile.js) e, per averla subito
// all'apertura dell'app, anche in localStorage.

export const LANGUAGES = [
  { value: "it-IT", label: "Italiano", locale: "it-IT" },
  { value: "en-US", label: "English", locale: "en-US" },
  { value: "es-ES", label: "Español", locale: "es-ES" },
  { value: "fr-FR", label: "Français", locale: "fr-FR" },
  { value: "de-DE", label: "Deutsch", locale: "de-DE" },
];

export const DEFAULT_LANGUAGE = "it-IT";

const STORAGE_KEY = "content-language";

function isSupported(value) {
  return LANGUAGES.some((lang) => lang.value === value);
}

function readStored() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isSupported(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

let currentLanguage = readStored();

export function getContentLanguage() {
  return currentLanguage;
}

export function setContentLanguage(value) {
  if (!isSupported(value)) return;
  currentLanguage = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage non disponibile: la scelta vale solo per questa sessione
  }
}
