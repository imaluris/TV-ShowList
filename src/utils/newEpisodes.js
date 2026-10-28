// Calcolo dei nuovi episodi. Funzioni pure, senza chiamate di rete.
//
// "Nuovo" = episodio uscito DOPO che hai iniziato a guardare la serie (e già
// uscito oggi) e non ancora spuntato. Se inizi oggi una serie del 2001, i suoi
// vecchi episodi non sono mai "novità": lo diventa solo ciò che esce dopo.

// Solo le serie già iniziate (in corso o viste) possono avere "novità":
// una serie "Da vedere" ha semplicemente tutto da guardare.
export function canHaveNewEpisodes(item) {
  return (
    item.mediaType === "tv" &&
    (item.status === "watching" || item.status === "watched")
  );
}

// Quando hai iniziato la serie, in millisecondi (ripiego: quando l'hai aggiunta).
// Subito dopo una scrittura il Timestamp può essere null: vale "adesso".
export function getStartedMillis(item) {
  const stamp = item.startedAt ?? item.addedAt;
  return stamp?.toMillis?.() ?? Date.now();
}

// Dagli episodi di una stagione ({episode_number, air_date}) ricava
// { key, time } con key "S{stagione}E{episodio}" e time = data di uscita.
export function toDatedKeys(seasonNumber, episodes) {
  return episodes
    .filter((episode) => episode.air_date)
    .map((episode) => ({
      key: `S${seasonNumber}E${episode.episode_number}`,
      time: new Date(episode.air_date).getTime(),
    }));
}

// Restituisce { count, newSeason } oppure null se non ci sono novità.
// `show.episodes` = [{ key, time }] degli episodi con la loro data.
// count = usciti dopo l'inizio, già in onda e non spuntati; newSeason = uno di
// loro è in una stagione più avanti di tutte quelle che hai iniziato.
export function getNewEpisodes(item, show, now = Date.now()) {
  if (!canHaveNewEpisodes(item) || !show?.episodes?.length) return null;

  const started = getStartedMillis(item);
  const watched = new Set(item.watchedEpisodes || []);
  const unseen = show.episodes.filter(
    (episode) =>
      episode.time > started && episode.time <= now && !watched.has(episode.key),
  );
  if (unseen.length === 0) return null;

  const seasonOf = (key) => Number(key.slice(1, key.indexOf("E")));
  const maxWatchedSeason = Math.max(0, ...[...watched].map(seasonOf));
  const newSeason = unseen.some((e) => seasonOf(e.key) > maxWatchedSeason);

  return { count: unseen.length, newSeason };
}
