import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// Preferenze dell'utente: un solo documento users/{uid}/profile/preferences.
// I generi sono separati per tipo, perché gli ID dei generi di TMDB per
// film e serie TV non coincidono:
//   { preferredGenres: { tv: [10759, 18], movie: [28] } }
function getPreferencesRef(uid) {
  return doc(db, "users", uid, "profile", "preferences");
}

export async function getPreferredGenres(uid, mediaType) {
  const snapshot = await getDoc(getPreferencesRef(uid));
  if (!snapshot.exists()) return [];
  return snapshot.data().preferredGenres?.[mediaType] || [];
}

export async function setPreferredGenres(uid, mediaType, genreIds) {
  // merge: true unisce anche le mappe annidate, quindi salvare i generi
  // dei film non cancella quelli delle serie TV (e viceversa).
  await setDoc(
    getPreferencesRef(uid),
    {
      preferredGenres: { [mediaType]: genreIds },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
