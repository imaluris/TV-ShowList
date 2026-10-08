import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getShowsByAnyGenre, getRecommendedShows } from "../services/tmdb";
import { getPreferredGenres } from "../services/profile";
import { getLibrary, LIBRARY_STATUS } from "../services/firestore";

// Quante righe "personali" mostrare al massimo, per non riempire la Home.
const MAX_GENRE_ROWS = 2;
const MAX_BECAUSE_ROWS = 2;

// Se una richiesta fallisce, quella riga resta semplicemente vuota.
function safe(promise) {
  return promise.catch((err) => {
    console.error("Errore nel caricare i consigliati:", err);
    return [];
  });
}

const EMPTY = { forYou: [], genreRows: [], becauseRows: [] };

// Costruisce i consigliati per la Home a partire da:
//  - i generi preferiti salvati su Firestore
//  - i titoli che l'utente ha visto o sta guardando
// Restituisce:
//  - forYou: titoli di uno qualsiasi dei generi preferiti
//  - genreRows: una riga per ciascuno dei primi generi preferiti ({ id, shows })
//  - becauseRows: "Perché hai visto X" ({ id, title, shows })
export function useRecommendations(mediaType) {
  const { currentUser } = useAuth();
  const uid = currentUser.uid;
  const [result, setResult] = useState(EMPTY);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [genreIds, library] = await Promise.all([
        safe(getPreferredGenres(uid, mediaType)),
        safe(getLibrary(uid)),
      ]);

      // Non consigliamo ciò che l'utente ha già in libreria.
      const owned = new Set(
        library.filter((item) => item.mediaType === mediaType).map((item) => item.tmdbId),
      );
      const notOwned = (shows) => shows.filter((show) => !owned.has(show.id));

      const seen = library
        .filter(
          (item) =>
            item.mediaType === mediaType &&
            (item.status === LIBRARY_STATUS.WATCHED ||
              item.status === LIBRARY_STATUS.WATCHING),
        )
        .slice(0, MAX_BECAUSE_ROWS);

      // Con un solo genere preferito la riga per genere sarebbe uguale a forYou.
      const genreRowIds = genreIds.length > 1 ? genreIds.slice(0, MAX_GENRE_ROWS) : [];

      const [forYou, genreRows, becauseRows] = await Promise.all([
        genreIds.length > 0
          ? safe(getShowsByAnyGenre(mediaType, genreIds)).then(notOwned)
          : [],
        Promise.all(
          genreRowIds.map(async (id) => ({
            id,
            shows: notOwned(await safe(getShowsByAnyGenre(mediaType, [id]))),
          })),
        ),
        Promise.all(
          seen.map(async (item) => ({
            id: item.id,
            title: item.title,
            shows: notOwned(await safe(getRecommendedShows(mediaType, item.tmdbId))),
          })),
        ),
      ]);

      if (!cancelled) setResult({ forYou, genreRows, becauseRows });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [uid, mediaType]);

  return result;
}
