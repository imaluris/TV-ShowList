import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getLibrary } from "../services/firestore";
import { getRuntimeMinutes } from "../services/tmdb";
import { computeStats, itemsNeedingRuntime } from "../utils/stats";

const CACHE_KEY = "runtime-cache";
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
    // niente cache: nessun problema, si riscarica la prossima volta
  }
}

// Carica la libreria e le durate da TMDB (con cache nel browser) e
// restituisce { stats, loading, error }.
export function useLibraryStats() {
  const { currentUser } = useAuth();
  const [state, setState] = useState({ stats: null, loading: true, error: false });

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    async function load() {
      try {
        const items = await getLibrary(currentUser.uid);
        const cache = readCache();
        const runtimes = {};
        const missing = [];

        itemsNeedingRuntime(items).forEach((item) => {
          if (cache[item.id]) runtimes[item.id] = cache[item.id];
          else missing.push(item);
        });

        // Scarica le durate mancanti, poche richieste alla volta.
        for (let i = 0; i < missing.length; i += PARALLEL_REQUESTS) {
          const chunk = missing.slice(i, i + PARALLEL_REQUESTS);
          await Promise.all(
            chunk.map(async (item) => {
              try {
                const minutes = await getRuntimeMinutes(item.mediaType, item.tmdbId);
                if (minutes) {
                  runtimes[item.id] = minutes;
                  cache[item.id] = minutes;
                }
              } catch (err) {
                console.error("Durata non disponibile:", item.id, err);
              }
            }),
          );
        }

        writeCache(cache);
        if (!cancelled) {
          setState({ stats: computeStats(items, runtimes), loading: false, error: false });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setState({ stats: null, loading: false, error: true });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  return state;
}
