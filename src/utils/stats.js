// Durata usata quando TMDB non conosce quella di un titolo (minuti).
export const DEFAULT_MOVIE_MINUTES = 100;
export const DEFAULT_EPISODE_MINUTES = 40;

// Trasforma un totale di minuti in giorni, ore e minuti.
export function splitDuration(totalMinutes) {
  const total = Math.max(0, Math.round(totalMinutes));
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60,
  };
}

// Calcola numeri e tempi dalla libreria.
// runtimes = { "movie-123": 120, "tv-45": 50 } (minuti di film / episodio medio)
export function computeStats(items, runtimes) {
  const stats = {
    moviesWatched: 0,
    seriesCompleted: 0,
    seriesInProgress: 0,
    episodesWatched: 0,
    toWatch: 0,
    movieMinutes: 0,
    seriesMinutes: 0,
  };

  items.forEach((item) => {
    if (item.status === "toWatch") stats.toWatch += 1;

    if (item.mediaType === "movie") {
      if (item.status === "watched") {
        stats.moviesWatched += 1;
        stats.movieMinutes += runtimes[item.id] || DEFAULT_MOVIE_MINUTES;
      }
      return;
    }

    if (item.status === "watched") stats.seriesCompleted += 1;
    if (item.status === "watching") stats.seriesInProgress += 1;

    const episodes = item.watchedEpisodes?.length || 0;
    stats.episodesWatched += episodes;
    stats.seriesMinutes += episodes * (runtimes[item.id] || DEFAULT_EPISODE_MINUTES);
  });

  stats.totalMinutes = stats.movieMinutes + stats.seriesMinutes;
  return stats;
}

// Quali titoli hanno bisogno della durata da TMDB.
export function itemsNeedingRuntime(items) {
  return items.filter((item) =>
    item.mediaType === "movie"
      ? item.status === "watched"
      : (item.watchedEpisodes?.length || 0) > 0,
  );
}
