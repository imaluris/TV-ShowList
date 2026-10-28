// Calcolo dei nuovi episodi. Funzioni pure, senza chiamate di rete.
//
// "Nuovo" = episodio uscito negli ultimi RECENT_DAYS giorni e non ancora
// spuntato. L'arretrato di una serie vecchia (episodi usciti anni fa che non
// hai ancora guardato) NON conta come novità.

export const RECENT_DAYS = 30;

// Solo le serie già iniziate (in corso o viste) possono avere "novità":
// una serie "Da vedere" ha semplicemente tutto da guardare.
export function canHaveNewEpisodes(item) {
  return (
    item.mediaType === "tv" &&
    (item.status === "watching" || item.status === "watched")
  );
}

// Dagli episodi di una stagione ({episode_number, air_date}) ricava le chiavi
// "S{stagione}E{episodio}" di quelli usciti negli ultimi RECENT_DAYS giorni
// (oggi compreso, futuro escluso).
export function getRecentKeys(seasonNumber, episodes, now = Date.now()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const from = now - RECENT_DAYS * dayMs;

  return episodes
    .filter((episode) => {
      if (!episode.air_date) return false;
      const time = new Date(episode.air_date).getTime();
      return time <= now && time >= from;
    })
    .map((episode) => `S${seasonNumber}E${episode.episode_number}`);
}

// Restituisce { count, newSeason } oppure null se non ci sono novità.
// `show.recentKeys` sono le chiavi degli episodi usciti da poco.
// count = quelli non spuntati; newSeason = uno di loro è in una stagione
// più avanti di tutte quelle che hai iniziato.
export function getNewEpisodes(item, show) {
  if (!canHaveNewEpisodes(item) || !show?.recentKeys?.length) return null;

  const watched = new Set(item.watchedEpisodes || []);
  const unseen = show.recentKeys.filter((key) => !watched.has(key));
  if (unseen.length === 0) return null;

  const seasonOf = (key) => Number(key.slice(1, key.indexOf("E")));
  const maxWatchedSeason = Math.max(0, ...[...watched].map(seasonOf));
  const newSeason = unseen.some((key) => seasonOf(key) > maxWatchedSeason);

  return { count: unseen.length, newSeason };
}
