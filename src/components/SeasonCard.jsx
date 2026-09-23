import { Link } from "react-router-dom";
import { IMG_URL } from "../services/tmdb";
import styles from "./SeasonCard.module.css";

function SeasonCard({ showId, season }) {
  const posterSrc = season.poster_path
    ? `${IMG_URL}${season.poster_path}`
    : "https://placehold.co/100x150?text=No+Image";

  const dateFormatted = season.air_date
    ? new Date(season.air_date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Data non disponibile";

  return (
    <Link to={`/show/${showId}/season/${season.season_number}`} className={styles.card}>
      <img src={posterSrc} alt={season.name} className={styles.poster} />

      <div className={styles.info}>
        <p className={styles.title}>Stagione {season.season_number}</p>
        <p className={styles.episodes}>{season.episode_count} episodi</p>
        <p className={styles.date}>{dateFormatted}</p>
      </div>

      <span className={styles.checkmark}>✓</span>
    </Link>
  );
}

export default SeasonCard;