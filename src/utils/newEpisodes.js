// Calcolo dei nuovi episodi: confronta gli episodi già usciti (da TMDB) con
// quelli spuntati nella libreria. Funzioni pure, senza chiamate di rete.

// Solo le serie già iniziate (in corso o viste) possono avere "novità":
// una serie "Da vedere" ha semplicemente tutto da guardare.
export function canHaveNewEpisodes(item) {
  return (
    item.mediaType === "tv" &&
    (item.status === "watching" || item.status === "watched")
  );
}

// Chiavi "S{stagione}E{episodio}" di tutti gli episodi già usciti.
// `show` contiene solo `seasons` e `lastEpisode` ({season_number, episode_number}).
export function getAiredKeys(show) {
  const last = show?.lastEpisode;
  if (!last) return [];

  const keys = [];
  (show.seasons || []).forEach((season) => {
    if (season.season_number === 0) return;

    if (season.season_number < last.season_number) {
      for (let ep = 1; ep <= season.episode_count; ep++) {
        keys.push(`S${season.season_number}E${ep}`);
      }
    } else if (season.season_number === last.season_number) {
      for (let ep = 1; ep <= last.episode_number; ep++) {
        keys.push(`S${season.season_number}E${ep}`);
      }
    }
  });
  return keys;
}

// Restituisce { count, newSeason } oppure null se non ci sono novità.
// count = episodi usciti e non spuntati; newSeason = c'è una stagione uscita
// più avanti di tutte quelle che hai iniziato.
export function getNewEpisodes(item, show) {
  if (!canHaveNewEpisodes(item) || !show) return null;

  const watched = new Set(item.watchedEpisodes || []);
  const unseen = getAiredKeys(show).filter((key) => !watched.has(key));
  if (unseen.length === 0) return null;

  const seasonOf = (key) => Number(key.slice(1, key.indexOf("E")));
  const maxWatchedSeason = Math.max(0, ...[...watched].map(seasonOf));
  const newSeason = unseen.some((key) => seasonOf(key) > maxWatchedSeason);

  return { count: unseen.length, newSeason };
}
