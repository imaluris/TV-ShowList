import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchShows, IMG_URL } from "../../services/tmdb";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { getTitle, getDate } from "../../utils/media";
import { ArrowLeft, X } from "lucide-react";
import styles from "./SearchOverlay.module.css";

function SearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const { mediaType, isMovie } = useMediaType();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    const timeoutId = setTimeout(() => {
      searchShows(mediaType, trimmed).then((data) => {
        setResults(data);
        setSearching(false);
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, mediaType]);

  function handleSelect(item) {
    navigate(`/show/${mediaType}/${item.id}`);
    onClose();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={onClose}>
          <ArrowLeft size={20} />
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder={isMovie ? "Cerca un film..." : "Cerca una serie TV..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />

        {query && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setQuery("")}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className={styles.results}>
        {searching ? (
          <p className={styles.message}>Ricerca...</p>
        ) : query.trim() && results.length === 0 ? (
          <p className={styles.message}>Nessun risultato per "{query}".</p>
        ) : (
          results.map((item) => {
            const title = getTitle(item);
            const date = getDate(item);
            const dateFormatted = date
              ? new Date(date).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "";
            const posterSrc = item.poster_path
              ? `${IMG_URL}${item.poster_path}`
              : "https://placehold.co/100x150?text=No+Image";

            return (
              <button
                key={item.id}
                type="button"
                className={styles.resultRow}
                onClick={() => handleSelect(item)}
              >
                <img src={posterSrc} alt={title} className={styles.poster} />
                <div className={styles.resultInfo}>
                  <p className={styles.resultTitle}>{title}</p>
                  {dateFormatted && (
                    <p className={styles.resultDate}>{dateFormatted}</p>
                  )}
                  <p className={styles.resultOverview}>
                    {item.overview || "Nessuna descrizione disponibile."}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SearchOverlay;