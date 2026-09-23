import { Link } from "react-router-dom";
import { IMG_URL } from "../services/tmdb";
import styles from "./ShowCard.module.css";

function ShowCard({ show }) {
  const posterSrc = show.poster_path
    ? `${IMG_URL}${show.poster_path}`
    : "https://placehold.co/200x300?text=No+Image";

  const year = show.first_air_date ? show.first_air_date.slice(0, 4) : "";

  return (
    <Link to={`/show/${show.id}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        <img src={posterSrc} alt={show.name} />

        {show.vote_average > 0 && (
          <span className={styles.rating}>★ {show.vote_average.toFixed(1)}</span>
        )}

        <button
          type="button"
          className={styles.menuButton}
          onClick={(e) => e.preventDefault()}
        >
          ⋮
        </button>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{show.name}</p>
        <p className={styles.year}>{year}</p>
      </div>
    </Link>
  );
}

export default ShowCard;