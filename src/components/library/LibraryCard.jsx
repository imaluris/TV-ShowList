import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { IMG_URL } from "../../services/tmdb";
import { removeFromLibrary } from "../../services/firestore";
import styles from "./LibraryCard.module.css";

function LibraryCard({ uid, item, onRemoved }) {
  const posterSrc = item.posterPath
    ? `${IMG_URL}${item.posterPath}`
    : "https://placehold.co/200x300?text=No+Image";

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
      </div>
    </Link>
  );
}

export default LibraryCard;