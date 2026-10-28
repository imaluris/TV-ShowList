import {
  doc,
  collection,
  getDocs,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { getLibrary } from "./firestore";
import { buildBackup, parseBackup } from "../utils/backup";

const BATCH_SIZE = 400; // il limite di Firestore è 500 scritture per batch

// Scarica la libreria e la restituisce nel formato del file di backup.
export async function createBackup(uid) {
  const items = await getLibrary(uid);
  return buildBackup(items);
}

// Avvia il download di un file JSON nel browser.
export function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Ripristina un backup: aggiunge SOLO i titoli che non sono già in libreria
// (quelli presenti restano come sono). Restituisce
// { added, existing, skipped } oppure lancia Error con il motivo.
export async function importBackup(uid, text) {
  const parsed = parseBackup(text);
  if (parsed.error) throw new Error(parsed.error);

  const libraryRef = collection(db, "users", uid, "library");
  const snapshot = await getDocs(libraryRef);
  const existingIds = new Set(snapshot.docs.map((docSnap) => docSnap.id));

  const toAdd = parsed.items.filter(
    (item) => !existingIds.has(`${item.mediaType}-${item.tmdbId}`),
  );

  for (let i = 0; i < toAdd.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);

    toAdd.slice(i, i + BATCH_SIZE).forEach((item) => {
      const { addedAt, startedAt, watchedAt, ...rest } = item;
      const data = { ...rest, updatedAt: serverTimestamp() };

      // Le date del backup tornano Timestamp; se mancano, l'aggiunta vale oggi.
      data.addedAt = addedAt ? Timestamp.fromDate(new Date(addedAt)) : serverTimestamp();
      if (startedAt) data.startedAt = Timestamp.fromDate(new Date(startedAt));
      if (watchedAt) data.watchedAt = Timestamp.fromDate(new Date(watchedAt));

      batch.set(doc(libraryRef, `${item.mediaType}-${item.tmdbId}`), data);
    });

    await batch.commit();
  }

  return {
    added: toAdd.length,
    existing: parsed.items.length - toAdd.length,
    skipped: parsed.skipped,
  };
}
