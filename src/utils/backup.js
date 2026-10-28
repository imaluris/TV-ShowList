// Backup della libreria: conversione da/verso il file JSON. Funzioni pure.
//
// Formato del file:
// { app: "tv-showlist", version: 1, exportedAt: "<ISO>", items: [ ... ] }
// Ogni item: mediaType, tmdbId, status, title, posterPath, addedAt, startedAt,
// watchedAt (date ISO) e, per le serie, watchedEpisodes, seasons, isOngoing.

export const BACKUP_APP = "tv-showlist";
export const BACKUP_VERSION = 1;

const STATUSES = ["watched", "watching", "toWatch"];
const MEDIA_TYPES = ["tv", "movie"];
const DATE_FIELDS = ["addedAt", "startedAt", "watchedAt"];

// Timestamp di Firestore -> stringa ISO (o null).
function toIso(stamp) {
  const date = stamp?.toDate?.();
  return date ? date.toISOString() : null;
}

// Dai documenti della libreria al contenuto del file.
export function buildBackup(items, now = new Date()) {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    items: items.map((item) => {
      const out = {
        mediaType: item.mediaType,
        tmdbId: item.tmdbId,
        status: item.status,
        title: item.title,
        posterPath: item.posterPath ?? null,
      };
      DATE_FIELDS.forEach((field) => {
        const iso = toIso(item[field]);
        if (iso) out[field] = iso;
      });
      if (item.mediaType === "tv") {
        out.watchedEpisodes = item.watchedEpisodes || [];
        if (item.seasons) out.seasons = item.seasons;
        if (typeof item.isOngoing === "boolean") out.isOngoing = item.isOngoing;
      }
      return out;
    }),
  };
}

function isValidSeason(season) {
  return (
    season &&
    Number.isInteger(season.season_number) &&
    Number.isInteger(season.episode_count) &&
    (season.aired_count === undefined || Number.isInteger(season.aired_count))
  );
}

// Controlla un singolo item e ne tiene solo i campi noti. Restituisce l'item
// pulito oppure null se non è valido.
function cleanItem(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!MEDIA_TYPES.includes(raw.mediaType)) return null;
  if (!Number.isInteger(raw.tmdbId) || raw.tmdbId <= 0) return null;
  if (!STATUSES.includes(raw.status)) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;

  const item = {
    mediaType: raw.mediaType,
    tmdbId: raw.tmdbId,
    status: raw.status,
    title: raw.title.slice(0, 300),
    posterPath: typeof raw.posterPath === "string" ? raw.posterPath : null,
  };

  DATE_FIELDS.forEach((field) => {
    const time = Date.parse(raw[field]);
    if (!Number.isNaN(time)) item[field] = new Date(time).toISOString();
  });

  if (raw.mediaType === "tv") {
    const watched = Array.isArray(raw.watchedEpisodes) ? raw.watchedEpisodes : [];
    item.watchedEpisodes = watched.filter(
      (key) => typeof key === "string" && /^S\d+E\d+$/.test(key),
    );
    if (Array.isArray(raw.seasons) && raw.seasons.every(isValidSeason)) {
      item.seasons = raw.seasons.map((season) => ({
        season_number: season.season_number,
        episode_count: season.episode_count,
        ...(season.aired_count !== undefined ? { aired_count: season.aired_count } : {}),
      }));
    }
    if (typeof raw.isOngoing === "boolean") item.isOngoing = raw.isOngoing;
  }

  return item;
}

// Legge il testo di un file di backup. Restituisce { items, skipped } oppure
// { error } se il file non è un backup valido. `skipped` = item scartati.
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: "This file is not a valid backup." };
  }

  if (data?.app !== BACKUP_APP || !Array.isArray(data.items)) {
    return { error: "This file is not a TV ShowList backup." };
  }
  if (data.version > BACKUP_VERSION) {
    return { error: "This backup was made by a newer version of the app." };
  }

  const items = [];
  const seen = new Set();
  let skipped = 0;

  data.items.forEach((raw) => {
    const item = cleanItem(raw);
    const id = item ? `${item.mediaType}-${item.tmdbId}` : null;
    if (!item || seen.has(id)) {
      skipped += 1;
      return;
    }
    seen.add(id);
    items.push(item);
  });

  return { items, skipped };
}
