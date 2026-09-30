import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { IMG_URL } from "../services/tmdb";
import { useAuth } from "../contexts/AuthContext";
import {
  getLibraryItem,
  toggleSeasonWatched,
  isSeasonWatched,
} from "../services/firestore";
import styles from "./SeasonCard.module.css";

function SeasonCard({ showId, mediaType, title, posterPath, season }) {
  const { currentUser } = useAuth();
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

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

  useEffect(() => {
    if (!currentUser) return;

    getLibraryItem(currentUser.uid, mediaType, showId).then((item) => {
      setWatchedEpisodes(item?.watchedEpisodes || []);
    });
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

    const nextWatched = await toggleSeasonWatched(currentUser.uid, {
      mediaType,
      tmdbId: showId,
      seasonNumber: season.season_number,
      episodeCount: season.episode_count,
      title,
      posterPath,
    });

    setWatchedEpisodes(nextWatched);
  }

  return (
    <Link to={`/show/${showId}/season/${season.season_number}`} className={styles.card}>
      <img src={posterSrc} alt={season.name} className={styles.poster} />

      <div className={styles.info}>
        <p className={styles.title}>Stagione {season.season_number}</p>
        <p className={styles.episodes}>{season.episode_count} episodi</p>
        <p className={styles.date}>{dateFormatted}</p>
      </div>

      <button
        type="button"
        className={watched ? styles.checkmarkActive : styles.checkmark}
        onClick={handleToggle}
        aria-label={watched ? "Segna stagione da vedere" : "Segna stagione vista"}
      >
        <Check size={16} />
      </button>
    </Link>
  );
}

export default SeasonCard;