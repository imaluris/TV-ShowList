import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { IMG_URL } from "../../services/tmdb";
import { useAuth } from "../../contexts/AuthContext";
import {
  subscribeToLibraryItem,
  toggleSeasonWatched,
  isSeasonWatched,
} from "../../services/firestore";
import styles from "./SeasonCard.module.css";
import { getContentLanguage } from "../../services/language";

function SeasonCard({ showId, mediaType, title, posterPath, seasons, season }) {
  const { currentUser } = useAuth();
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

  const posterSrc = season.poster_path
    ? `${IMG_URL}${season.poster_path}`
    : "https://placehold.co/100x150?text=No+Image";

  const dateFormatted = season.air_date
    ? new Date(season.air_date).toLocaleDateString(getContentLanguage(), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date not available";

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToLibraryItem(
      currentUser.uid,
      mediaType,
      showId,
      (item) => {
        setWatchedEpisodes(item?.watchedEpisodes || []);
      },
    );

    return unsubscribe;
  }, [currentUser, mediaType, showId]);

  const watched = isSeasonWatched(
    watchedEpisodes,
    season.season_number,
    season.episode_count,
  );

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    await toggleSeasonWatched(currentUser.uid, {
      mediaType,
      tmdbId: showId,
      seasonNumber: season.season_number,
      episodeCount: season.episode_count,
      title,
      posterPath,
      seasons,
    });
  }

  return (
    <Link to={`/show/${showId}/season/${season.season_number}`} className={styles.card}>
      <img src={posterSrc} alt={season.name} className={styles.poster} loading="lazy" />

      <div className={styles.info}>
        <p className={styles.title}>Season {season.season_number}</p>
        <p className={styles.episodes}>{season.episode_count} {season.episode_count === 1 ? "episode" : "episodes"}</p>
        <p className={styles.date}>{dateFormatted}</p>
      </div>

      <button
        type="button"
        className={watched ? styles.checkmarkActive : styles.checkmark}
        onClick={handleToggle}
        aria-label={watched ? "Mark season as unwatched" : "Mark season as watched"}
      >
        <Check size={16} />
      </button>
    </Link>
  );
}

export default SeasonCard;