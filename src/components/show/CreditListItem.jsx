import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { IMG_URL } from "../../services/tmdb";
import styles from "./CreditListItem.module.css";
import { getContentLanguage } from "../../services/language";

function CreditListItem({ item }) {
  const posterSrc = item.poster_path
    ? `${IMG_URL}${item.poster_path}`
    : "https://placehold.co/100x150?text=No+Image";

  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const dateFormatted = date
    ? new Date(date).toLocaleDateString(getContentLanguage(), {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not available";

  const mediaLabel = item.media_type === "movie" ? "Movie" : "TV show";

  return (
    <Link to={`/show/${item.media_type === "movie" ? "movie" : "tv"}/${item.id}`} className={styles.card}>
      <img src={posterSrc} alt={title} className={styles.poster} loading="lazy" />

      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        {item.character && (
          <p className={styles.character}>as {item.character}</p>
        )}
        <p className={styles.meta}>
          {item.vote_average > 0 && (
            <span className={styles.rating}>
              <Star size={12} fill="currentColor" /> {item.vote_average.toFixed(1)}
            </span>
          )}
          <span className={styles.badge}>{mediaLabel}</span>
          <span>{dateFormatted}</span>
        </p>
      </div>
    </Link>
  );
}

export default CreditListItem;