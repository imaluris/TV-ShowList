import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { IMG_URL } from "../../services/tmdb";
import { removeFromLibrary } from "../../services/firestore";
import styles from "./LibraryCard.module.css";

function LibraryCard({ uid, item, onRemoved }) {
  const posterSrc = item.posterPath
    ? `${IMG_URL}${item.posterPath}`
    : "https://placehold.co/200x300?text=No+Image";

  // Avanzamento: episodi spuntati sul totale salvato nel documento.
  const totalEpisodes = item.seasons
    ? item.seasons.reduce((sum, season) => sum + season.episode_count, 0)
    : 0;
  const watchedCount = Math.min(item.watchedEpisodes?.length || 0, totalEpisodes);
  const showProgress =
    item.mediaType === "tv" && totalEpisodes > 0 && watchedCount > 0;
  const percent = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

  async function handleRemove(e) {
    e.preventDefault();
    await removeFromLibrary(uid, item.mediaType, item.tmdbId);
    onRemoved(item.id);
  }

  return (
    <Link to={`/show/${item.mediaType}/${item.tmdbId}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        <img src={posterSrc} alt={item.title} />

        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="Rimuovi dalla libreria"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{item.title}</p>

        {showProgress && (
          <>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>
            <p className={styles.progressText}>
              {watchedCount}/{totalEpisodes} episodi
            </p>
          </>
        )}
      </div>
    </Link>
  );
}

export default LibraryCard;