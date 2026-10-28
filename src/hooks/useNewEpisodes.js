import { useState, useEffect } from "react";
import { getShowDetails, getSeasonAirDates } from "../services/tmdb";
import {
  canHaveNewEpisodes,
  getNewEpisodes,
  getStartedMillis,
  toDatedKeys,
} from "../utils/newEpisodes";

const CACHE_KEY = "new-episodes-cache-v3";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 ore
const PARALLEL_REQUESTS = 5;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // niente cache: si riscarica alla prossima visita
  }
}

const MAX_SEASONS = 4; // al massimo le ultime stagioni da controllare

// Scarica le date degli episodi dell'ultima stagione e, se anche quella è
// uscita tutta dopo l'inizio, di quelle precedenti. Se l'ultimo episodio è
// uscito prima che iniziassi la serie non c'è nulla di nuovo: nessuna chiamata.
async function loadEpisodes(tmdbId, details, startedMs) {
  const last = details.last_episode_to_air;
  if (!last?.air_date) return [];
  if (new Date(last.air_date).getTime() <= startedMs) return [];

  const episodes = [];
  for (let n = 0; n < MAX_SEASONS; n++) {
    const seasonNumber = last.season_number - n;
    if (seasonNumber < 1) break;

    const dated = toDatedKeys(
      seasonNumber,
      await getSeasonAirDates(tmdbId, seasonNumber),
    );
    episodes.push(...dated);

    // Se questa stagione ha episodi usciti prima dell'inizio, le precedenti
    // sono tutte vecchie e ci fermiamo qui.
    if (dated.some((episode) => episode.time <= startedMs)) break;
  }
  return episodes;
}

// Dato l'elenco della libreria, restituisce una mappa
// { [id documento]: { count, newSeason } } con le serie che hanno episodi
// usciti e non ancora visti. I dati di TMDB restano in cache per 6 ore.
export function useNewEpisodes(items) {
  const [shows, setShows] = useState({});

  // Cambia solo quando cambiano le serie da controllare (non a ogni spunta).
  const eligibleIds = items
    .filter(canHaveNewEpisodes)
    .map((item) => `${item.id}:${getStartedMillis(item)}`)
    .sort()
    .join(",");

  useEffect(() => {
    if (!eligibleIds) return;
    let cancelled = false;

    async function load() {
      const cache = readCache();
      const now = Date.now();
      const loaded = {};
      const missing = [];

      eligibleIds.split(",").forEach((entry) => {
        const [id, started] = entry.split(":");
        const startedMs = Number(started);
        const cached = cache[id];
        const isFresh =
          cached &&
          cached.startedMs === startedMs &&
          now - cached.at < CACHE_MAX_AGE_MS;
        if (isFresh) loaded[id] = cached;
        else missing.push({ id, startedMs });
      });
      if (!cancelled) setShows((prev) => ({ ...prev, ...loaded }));

      for (let i = 0; i < missing.length; i += PARALLEL_REQUESTS) {
        const chunk = missing.slice(i, i + PARALLEL_REQUESTS);
        await Promise.all(
          chunk.map(async ({ id, startedMs }) => {
            const tmdbId = id.replace(/^tv-/, "");
            try {
              const details = await getShowDetails("tv", tmdbId);
              const entry = {
                at: Date.now(),
                startedMs,
                episodes: await loadEpisodes(tmdbId, details, startedMs),
              };
              cache[id] = entry;
              loaded[id] = entry;
            } catch (err) {
              console.error("Nuovi episodi non disponibili:", id, err);
            }
          }),
        );
      }

      writeCache(cache);
      if (!cancelled) setShows((prev) => ({ ...prev, ...loaded }));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eligibleIds]);

  const result = {};
  items.forEach((item) => {
    const news = getNewEpisodes(item, shows[item.id]);
    if (news) result[item.id] = news;
  });
  return result;
}
