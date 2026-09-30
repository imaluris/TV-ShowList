import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { IMG_URL } from "../services/tmdb";
import { useAuth } from "../contexts/AuthContext";
import {
  getLibraryItem,
  toggleEpisodeWatched,
  isEpisodeWatched,
} from "../services/firestore";
import styles from "./EpisodeCard.module.css";

function EpisodeCard({ showId, mediaType, title, posterPath, seasonNumber, episode }) {
  const { currentUser } = useAuth();
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

  const thumbSrc = episode.still_path
    ? `${IMG_URL}${episode.still_path}`
    : null;

  const dateFormatted = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
      })
    : null;

  useEffect(() => {
    if (!currentUser) return;

    getLibraryItem(currentUser.uid, mediaType, showId).then((item) => {
      setWatchedEpisodes(item?.watchedEpisodes || []);
    });
  }, [currentUser, mediaType, showId]);

  const watched = isEpisodeWatched(
    watchedEpisodes,
    seasonNumber,
    episode.episode_number,
  );

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    const nextWatched = await toggleEpisodeWatched(currentUser.uid, {
      mediaType,
      tmdbId: showId,
      seasonNumber,
      episodeNumber: episode.episode_number,
      title,
      posterPath,
    });

    setWatchedEpisodes(nextWatched);
  }

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

      <button
        type="button"
        className={watched ? styles.checkmarkActive : styles.checkmark}
        onClick={handleToggle}
        aria-label={watched ? "Segna episodio da vedere" : "Segna episodio visto"}
      >
        <Check size={18} />
      </button>
    </Link>
  );
}

export default EpisodeCard;