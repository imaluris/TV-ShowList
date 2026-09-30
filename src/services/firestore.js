import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const LIBRARY_STATUS = {
  WATCHED: "watched",
  WATCHING: "watching",
  TO_WATCH: "toWatch",
};

function getLibraryDocId(mediaType, tmdbId) {
  return `${mediaType}-${tmdbId}`;
}

function getLibraryDocRef(uid, mediaType, tmdbId) {
  return doc(db, "users", uid, "library", getLibraryDocId(mediaType, tmdbId));
}

// Legge lo stato di UN titolo (usata in ShowDetail per sapere se è già
// salvato e con che stato, quando apri la pagina).
export async function getLibraryItem(uid, mediaType, tmdbId) {
  const snapshot = await getDoc(getLibraryDocRef(uid, mediaType, tmdbId));
  return snapshot.exists() ? snapshot.data() : null;
}

// Aggiunge un titolo alla libreria, o ne aggiorna solo lo stato se c'è già.
// addedAt viene scritto SOLO alla creazione (letto prima per deciderlo),
// updatedAt viene sempre aggiornato.
export async function setLibraryStatus(uid, { mediaType, tmdbId, status, title, posterPath }) {
  const ref = getLibraryDocRef(uid, mediaType, tmdbId);
  const existing = await getDoc(ref);

  await setDoc(
    ref,
    {
      mediaType,
      tmdbId,
      status,
      title,
      posterPath,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { addedAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

// Rimuove un titolo dalla libreria (pulsante "rimuovi").
export async function removeFromLibrary(uid, mediaType, tmdbId) {
  await deleteDoc(getLibraryDocRef(uid, mediaType, tmdbId));
}

// Ascolta IN TEMPO REALE tutta la libreria di un utente (usata dalla
// pagina Libreria). Ritorna una funzione "unsubscribe" da chiamare nel
// cleanup di useEffect, altrimenti l'ascolto resta attivo per sempre.
export function subscribeToLibrary(uid, onChange) {
  const q = query(
    collection(db, "users", uid, "library"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    onChange(items);
  });
}