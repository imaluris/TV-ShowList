import { useState, useEffect } from "react";
import { getShowDetails } from "../services/tmdb";
import { canHaveNewEpisodes, getNewEpisodes } from "../utils/newEpisodes";

const CACHE_KEY = "new-episodes-cache";
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

// Di ogni serie teniamo solo ciò che serve: stagioni e ultimo episodio uscito.
function slimShow(details) {
  const last = details.last_episode_to_air;
  return {
    at: Date.now(),
    seasons: (details.seasons || []).map((s) => ({
      season_number: s.season_number,
      episode_count: s.episode_count,
    })),
    lastEpisode: last
      ? { season_number: last.season_number, episode_number: last.episode_number }
      : null,
  };
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
              const slim = slimShow(details);
              cache[id] = slim;
              loaded[id] = slim;
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
