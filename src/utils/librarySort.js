// Criteri di ordinamento della libreria.
export const SORT_OPTIONS = [
  { value: "finishedRecent", label: "Finished recently" },
  { value: "finishedOld", label: "Finished long ago" },
  { value: "addedRecent", label: "Added recently" },
  { value: "addedOld", label: "Added long ago" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
];

export const DEFAULT_SORT = "addedRecent";

// Le date di Firestore sono Timestamp. Subito dopo una scrittura possono essere
// ancora null (il server non ha risposto): in quel caso valgono "adesso".
function toMillis(timestamp) {
  return timestamp?.toMillis?.() ?? Date.now();
}

// Data di fine visione: i titoli visti prima di watchedAt usano updatedAt.
function getFinishedTime(item) {
  return toMillis(item.watchedAt ?? item.updatedAt);
}

function getAddedTime(item) {
  return toMillis(item.addedAt ?? item.updatedAt);
}

function compareTitles(a, b) {
  return (a.title || "").localeCompare(b.title || "", undefined, {
    sensitivity: "base",
  });
}

// Restituisce una copia ordinata (sort modifica l'array originale).
export function sortLibraryItems(items, sortBy) {
  const copy = [...items];

  switch (sortBy) {
    case "finishedRecent":
      return copy.sort((a, b) => getFinishedTime(b) - getFinishedTime(a));
    case "finishedOld":
      return copy.sort((a, b) => getFinishedTime(a) - getFinishedTime(b));
    case "addedOld":
      return copy.sort((a, b) => getAddedTime(a) - getAddedTime(b));
    case "az":
      return copy.sort(compareTitles);
    case "za":
      return copy.sort((a, b) => compareTitles(b, a));
    case "addedRecent":
    default:
      return copy.sort((a, b) => getAddedTime(b) - getAddedTime(a));
  }
}
