import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "../firebase/config";

// Errori per cui il popup non può funzionare (browser che lo blocca, PWA
// installata, ecc.): in quel caso si passa al reindirizzamento.
const POPUP_FALLBACK_CODES = [
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
];

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

// Accesso (o registrazione, se è la prima volta) con Google.
// Restituisce true se l'accesso è avvenuto subito; con il reindirizzamento
// la pagina si ricarica e ci pensa AuthContext a vedere l'utente loggato.
export async function signInWithGoogle() {
  const provider = createGoogleProvider();

  try {
    await signInWithPopup(auth, provider);
    return true;
  } catch (err) {
    if (POPUP_FALLBACK_CODES.includes(err.code)) {
      await signInWithRedirect(auth, provider);
      return false;
    }
    throw err;
  }
}

// Gli utenti entrati solo con Google non hanno una password da noi.
export function hasPasswordProvider(user) {
  return user.providerData.some((info) => info.providerId === "password");
}
