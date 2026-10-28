import { useState, useEffect } from "react";
import { getShowDetails, getSeasonAirDates } from "../services/tmdb";
import {
  RECENT_DAYS,
  canHaveNewEpisodes,
  getNewEpisodes,
  getRecentKeys,
} from "../utils/newEpisodes";

const CACHE_KEY = "new-episodes-cache-v2";
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

// Di ogni serie teniamo solo le chiavi degli episodi usciti da poco. Se
// l'ultimo episodio è uscito da più di RECENT_DAYS giorni non c'è nulla di
// nuovo e non serve nemmeno scaricare la stagione.
async function loadRecentKeys(tmdbId, details) {
  const last = details.last_episode_to_air;
  if (!last?.air_date) return [];

  const ageDays = (Date.now() - new Date(last.air_date).getTime()) / 86400000;
  if (ageDays > RECENT_DAYS) return [];

  const episodes = await getSeasonAirDates(tmdbId, last.season_number);
  return getRecentKeys(last.season_number, episodes);
}

// Dato l'elenco della libreria, restituisce una mappa
// { [id documento]: { count, newSeason } } con le serie che hanno episodi
// usciti e non ancora visti. I dati di TMDB restano in cache per 6 ore.
export function useNewEpisodes(items) {
  const [shows, setShows] = useState({});

  // Cambia solo quando cambiano le serie da controllare (non a ogni spunta).
  const eligibleIds = items
    .filter(canHaveNewEpisodes)
    .map((item) => `${item.id}`)
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

      eligibleIds.split(",").forEach((id) => {
        const cached = cache[id];
        if (cached && now - cached.at < CACHE_MAX_AGE_MS) loaded[id] = cached;
        else missing.push(id);
      });
      if (!cancelled) setShows((prev) => ({ ...prev, ...loaded }));

      for (let i = 0; i < missing.length; i += PARALLEL_REQUESTS) {
        const chunk = missing.slice(i, i + PARALLEL_REQUESTS);
        await Promise.all(
          chunk.map(async (id) => {
            const tmdbId = id.replace(/^tv-/, "");
            try {
              const details = await getShowDetails("tv", tmdbId);
              const entry = {
                at: Date.now(),
                recentKeys: await loadRecentKeys(tmdbId, details),
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
