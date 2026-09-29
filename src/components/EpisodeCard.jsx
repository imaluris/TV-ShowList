import { Link } from "react-router-dom";
import { IMG_URL } from "../services/tmdb";
import styles from "./EpisodeCard.module.css";

function EpisodeCard({ showId, seasonNumber, episode }) {
  const thumbSrc = episode.still_path
    ? `${IMG_URL}${episode.still_path}`
    : null;

  const dateFormatted = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <Link
      to={`/show/${showId}/season/${seasonNumber}/episode/${episode.episode_number}`}
      className={styles.card}
    >
      {thumbSrc ? (
        <img src={thumbSrc} alt={episode.name} className={styles.thumb} />
      ) : (
        <div className={styles.thumbPlaceholder}>📺</div>
      )}

      <div className={styles.info}>
        <p className={styles.title}>
          {episode.episode_number}. {episode.name}
        </p>

        <p className={styles.meta}>
          {dateFormatted && <span>📅 {dateFormatted}</span>}
          {episode.vote_average > 0 && (
            <span>⭐ {episode.vote_average.toFixed(1)}</span>
          )}
        </p>

        <p className={styles.overview}>
          {episode.overview || "Nessuna descrizione disponibile."}
        </p>
      </div>
    </Link>
  );
}

export default EpisodeCard;