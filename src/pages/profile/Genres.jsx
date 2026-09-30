import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getGenres } from "../../services/tmdb";
import { useMediaType } from "../../contexts/MediaTypeContext";
import styles from "./Genres.module.css";

function Genres() {
  const { mediaType } = useMediaType();
  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("preferred-genres");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    getGenres(mediaType).then(setGenres);
  }, [mediaType]);

  useEffect(() => {
    localStorage.setItem("preferred-genres", JSON.stringify(selected));
  }, [selected]);

  function toggleGenre(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
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
        verranno usati in futuro per consigliarti titoli.
      </p>

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