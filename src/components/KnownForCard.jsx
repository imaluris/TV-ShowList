import { IMG_URL } from "../services/tmdb";
import styles from "./KnownForCard.module.css";

function KnownForCard({ item }) {
  const posterSrc = item.poster_path
    ? `${IMG_URL}${item.poster_path}`
    : "https://placehold.co/200x300?text=No+Image";

  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const year = date ? date.slice(0, 4) : "";

  return (
    <div className={styles.card}>
      <div className={styles.posterWrapper}>
        <img src={posterSrc} alt={title} />
        {item.vote_average > 0 && (
          <span className={styles.rating}>
            ★ {item.vote_average.toFixed(1)}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <p className={styles.caption}>
          {year}
          {item.character ? ` ${item.character}` : ""}
        </p>
      </div>
    </div>
  );
}

export default KnownForCard;