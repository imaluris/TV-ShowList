import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getGenres } from "../../services/tmdb";
import { getPreferredGenres, setPreferredGenres } from "../../services/profile";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Genres.module.css";

function Genres() {
  const { mediaType } = useMediaType();
  const { currentUser } = useAuth();
  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getGenres(mediaType).then(setGenres);
  }, [mediaType]);

  // I generi scelti vivono su Firestore, separati per film e serie TV.
  useEffect(() => {
    let cancelled = false;

    setSelected([]);
    getPreferredGenres(currentUser.uid, mediaType)
      .then((ids) => {
        if (!cancelled) setSelected(ids);
      })
      .catch((err) => {
        console.error("Impossibile caricare i generi preferiti:", err);
        if (!cancelled) setError("Non riesco a caricare i generi salvati.");
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser.uid, mediaType]);

  async function toggleGenre(id) {
    const previous = selected;
    const next = previous.includes(id)
      ? previous.filter((g) => g !== id)
      : [...previous, id];

    // Aggiorniamo subito lo schermo; se il salvataggio fallisce torniamo indietro.
    setSelected(next);
    setError("");

    try {
      await setPreferredGenres(currentUser.uid, mediaType, next);
    } catch (err) {
      console.error("Impossibile salvare i generi preferiti:", err);
      setSelected(previous);
      setError("Salvataggio non riuscito, riprova.");
    }
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
