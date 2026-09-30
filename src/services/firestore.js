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

function getEpisodeKey(seasonNumber, episodeNumber) {
  return `S${seasonNumber}E${episodeNumber}`;
}

function getSeasonKeys(seasonNumber, episodeCount) {
  const keys = [];
  for (let ep = 1; ep <= episodeCount; ep++) {
    keys.push(getEpisodeKey(seasonNumber, ep));
  }
  return keys;
}

// Tutte le chiavi episodio di tutte le stagioni passate (usato quando
// si marca l'intera serie come "Vista").
function getAllEpisodeKeys(seasons) {
  const keys = [];
  seasons.forEach((season) => {
    keys.push(...getSeasonKeys(season.season_number, season.episode_count));
  });
  return keys;
}

// Se stai spuntando qualcosa come visto e la serie non ha ancora uno
// stato (o era "Da vedere"), la fa diventare "In corso" in automatico.
// Se è già "In corso" o "Vista", non la tocca.
function nextStatusOnMark(currentStatus) {
  if (
    currentStatus === LIBRARY_STATUS.WATCHING ||
    currentStatus === LIBRARY_STATUS.WATCHED
  ) {
    return currentStatus;
  }
  return LIBRARY_STATUS.WATCHING;
}

export function isEpisodeWatched(watchedEpisodes, seasonNumber, episodeNumber) {
  if (!watchedEpisodes) return false;
  return watchedEpisodes.includes(getEpisodeKey(seasonNumber, episodeNumber));
}

export function isSeasonWatched(watchedEpisodes, seasonNumber, episodeCount) {
  if (!watchedEpisodes || !episodeCount) return false;
  return getSeasonKeys(seasonNumber, episodeCount).every((key) =>
    watchedEpisodes.includes(key),
  );
}

export async function getLibraryItem(uid, mediaType, tmdbId) {
  const snapshot = await getDoc(getLibraryDocRef(uid, mediaType, tmdbId));
  return snapshot.exists() ? snapshot.data() : null;
}

// Ascolto in tempo reale sul singolo documento libreria: onChange viene
// richiamata subito e ogni volta che il documento cambia (anche se la
// modifica arriva da un altro componente della stessa pagina).
export function subscribeToLibraryItem(uid, mediaType, tmdbId, onChange) {
  const ref = getLibraryDocRef(uid, mediaType, tmdbId);
  return onSnapshot(ref, (snapshot) => {
    onChange(snapshot.exists() ? snapshot.data() : null);
  });
}

export async function setLibraryStatus(
  uid,
  { mediaType, tmdbId, status, title, posterPath, seasons },
) {
  const ref = getLibraryDocRef(uid, mediaType, tmdbId);
  const existing = await getDoc(ref);

  // Se segni l'intera serie come "Vista" (e hai passato le stagioni),
  // spuntiamo automaticamente anche tutti gli episodi.
  const shouldMarkAllWatched =
    status === LIBRARY_STATUS.WATCHED && mediaType === "tv" && seasons?.length > 0;

  await setDoc(
    ref,
    {
      mediaType,
      tmdbId,
      status,
      title,
      posterPath,
      ...(shouldMarkAllWatched
        ? { watchedEpisodes: getAllEpisodeKeys(seasons) }
        : {}),
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { addedAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

export async function removeFromLibrary(uid, mediaType, tmdbId) {
  await deleteDoc(getLibraryDocRef(uid, mediaType, tmdbId));
}

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

export async function toggleEpisodeWatched(
  uid,
  { mediaType, tmdbId, seasonNumber, episodeNumber, title, posterPath },
) {
  const ref = getLibraryDocRef(uid, mediaType, tmdbId);
  const existing = await getDoc(ref);
  const data = existing.exists() ? existing.data() : null;
  const currentWatched = data?.watchedEpisodes || [];
  const key = getEpisodeKey(seasonNumber, episodeNumber);
  const alreadyWatched = currentWatched.includes(key);

  const nextWatched = alreadyWatched
    ? currentWatched.filter((k) => k !== key)
    : [...currentWatched, key];

  await setDoc(
    ref,
    {
      mediaType,
      tmdbId,
      title,
      posterPath,
      watchedEpisodes: nextWatched,
      ...(alreadyWatched ? {} : { status: nextStatusOnMark(data?.status) }),
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { addedAt: serverTimestamp() }),
    },
    { merge: true },
  );

  return nextWatched;
}

export async function toggleSeasonWatched(
  uid,
  { mediaType, tmdbId, seasonNumber, episodeCount, title, posterPath },
) {
  const ref = getLibraryDocRef(uid, mediaType, tmdbId);
  const existing = await getDoc(ref);
  const data = existing.exists() ? existing.data() : null;
  const currentWatched = data?.watchedEpisodes || [];
  const seasonKeys = getSeasonKeys(seasonNumber, episodeCount);
  const fullyWatched = seasonKeys.every((key) => currentWatched.includes(key));

  const nextWatched = fullyWatched
    ? currentWatched.filter((key) => !seasonKeys.includes(key))
    : [...new Set([...currentWatched, ...seasonKeys])];

  await setDoc(
    ref,
    {
      mediaType,
      tmdbId,
      title,
      posterPath,
      watchedEpisodes: nextWatched,
      ...(fullyWatched ? {} : { status: nextStatusOnMark(data?.status) }),
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { addedAt: serverTimestamp() }),
    },
    { merge: true },
  );

  return nextWatched;
}