import { Link } from "react-router-dom";
import { IMG_URL } from "../services/tmdb";
import { useMediaType } from "../contexts/MediaTypeContext";
import { getTitle, getYear } from "../utils/media";
import styles from "./ShowCard.module.css";

function ShowCard({ show }) {
  const { mediaType } = useMediaType();
  const title = getTitle(show);
  const year = getYear(show);

  const posterSrc = show.poster_path
    ? `${IMG_URL}${show.poster_path}`
    : "https://placehold.co/200x300?text=No+Image";

  return (
    <Link to={`/show/${mediaType}/${show.id}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        <img src={posterSrc} alt={title} />

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
        <p className={styles.title}>{title}</p>
        <p className={styles.year}>{year}</p>
      </div>
    </Link>
  );
}

export default ShowCard;