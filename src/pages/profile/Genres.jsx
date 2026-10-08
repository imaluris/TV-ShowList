import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getGenres } from "../../services/tmdb";
import { getPreferredGenres, setPreferredGenres } from "../../services/profile";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Genres.module.css";

// Dopo l'ultimo click aspettiamo questo tempo prima di salvare: così una
// raffica di click diventa una sola scrittura su Firestore.
const SAVE_DELAY_MS = 500;

function Genres() {
  const { mediaType } = useMediaType();
  const { currentUser } = useAuth();
  const uid = currentUser.uid;

  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  // selectedRef tiene sempre l'ultima lista, anche tra due click così veloci
  // che React non ha ancora ridisegnato la pagina.
  const selectedRef = useRef([]);
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    getGenres(mediaType).then(setGenres);
  }, [mediaType]);

  function updateSelected(ids) {
    selectedRef.current = ids;
    setSelected(ids);
  }

  async function save(pending) {
    try {
      await setPreferredGenres(uid, pending.mediaType, pending.ids);
      setError("");
    } catch (err) {
      console.error("Impossibile salvare i generi preferiti:", err);
      setError("Salvataggio non riuscito, riprova.");
    }
  }

  // Salva subito l'eventuale modifica in attesa (usato anche quando si esce
  // dalla pagina o si cambia tra film e serie TV).
  function flushPendingSave() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current) {
      const pending = pendingRef.current;
      pendingRef.current = null;
      save(pending);
    }
  }

  // I generi scelti vivono su Firestore, separati per film e serie TV.
  useEffect(() => {
    let cancelled = false;

    updateSelected([]);
    getPreferredGenres(uid, mediaType)
      .then((ids) => {
        if (!cancelled) updateSelected(ids);
      })
      .catch((err) => {
        console.error("Impossibile caricare i generi preferiti:", err);
        if (!cancelled) setError("Non riesco a caricare i generi salvati.");
      });

    return () => {
      cancelled = true;
      flushPendingSave();
    };
    // flushPendingSave e updateSelected usano solo ref e setState: non servono come dipendenze.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, mediaType]);

  function toggleGenre(id) {
    const current = selectedRef.current;
    const next = current.includes(id)
      ? current.filter((g) => g !== id)
      : [...current, id];

    updateSelected(next);
    setError("");

    // Ogni salvataggio scrive la lista completa, quindi conta solo l'ultimo.
    pendingRef.current = { mediaType, ids: next };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushPendingSave, SAVE_DELAY_MS);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/profile" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Generi preferiti</h1>
      </div>

      <p className={styles.note}>
        Seleziona i generi che preferisci ({mediaType === "movie" ? "film" : "serie tv"}):
        li usiamo per mostrarti titoli consigliati nella Home.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.genreGrid}>
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className={
              selected.includes(genre.id) ? styles.genreChipActive : styles.genreChip
            }
            onClick={() => toggleGenre(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Genres;
