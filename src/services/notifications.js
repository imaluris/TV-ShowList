import { doc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken, deleteToken, isSupported } from "firebase/messaging";
import { app, db } from "../firebase/config";

// Chiave pubblica per le notifiche web (Firebase console → Impostazioni
// progetto → Cloud Messaging → Configurazione web → Coppia di chiavi).
// Non è un segreto.
const VAPID_KEY = "";

const TOKEN_STORAGE_KEY = "push-token";

// I token (uno per dispositivo) stanno nello stesso documento delle altre
// preferenze: la regola Firestore esistente su profile/{docId} basta.
function getNotificationsRef(uid) {
  return doc(db, "users", uid, "profile", "notifications");
}

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // senza localStorage lo stato del toggle non si ricorda tra le visite
  }
}

// Il browser supporta le notifiche push?
export async function isPushSupported() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;
  return isSupported();
}

// "granted" | "denied" | "default"
export function getPermission() {
  return "Notification" in window ? Notification.permission : "denied";
}

// Le notifiche sono attive su QUESTO dispositivo?
export function isEnabledOnThisDevice() {
  return getPermission() === "granted" && Boolean(readStoredToken());
}

// Chiede il permesso, ottiene il token del dispositivo e lo salva su Firestore.
// Lancia Error con un `code` leggibile: not-configured, permission-denied,
// no-service-worker.
export async function enableNotifications(uid) {
  if (!VAPID_KEY) {
    throw Object.assign(new Error("VAPID key missing"), { code: "not-configured" });
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw Object.assign(new Error("Permission not granted"), {
      code: "permission-denied",
    });
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw Object.assign(new Error("No service worker"), { code: "no-service-worker" });
  }

  const token = await getToken(getMessaging(app), {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  await setDoc(
    getNotificationsRef(uid),
    { tokens: arrayUnion(token), updatedAt: serverTimestamp() },
    { merge: true },
  );
  storeToken(token);
  return token;
}

// Spegne le notifiche su questo dispositivo: toglie il token da Firestore e
// dal browser.
export async function disableNotifications(uid) {
  const token = readStoredToken();

  if (token) {
    await setDoc(
      getNotificationsRef(uid),
      { tokens: arrayRemove(token), updatedAt: serverTimestamp() },
      { merge: true },
    );
    try {
      await deleteToken(getMessaging(app));
    } catch (err) {
      console.error("Impossibile eliminare il token:", err);
    }
  }
  storeToken(null);
}
