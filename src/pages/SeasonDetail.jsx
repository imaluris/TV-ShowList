import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSeasonDetails,
  getAggregateCreditsShow,
  IMG_URL_LARGE,
} from "../services/tmdb";
import CastCard from "../components/CastCard";
import EpisodeCard from "../components/EpisodeCard";
import styles from "./SeasonDetail.module.css";
import { ArrowLeft } from "lucide-react";

function SeasonDetail() {
  const { showId, seasonNumber } = useParams();
  const [season, setSeason] = useState(null);
  const [showCredits, setShowCredits] = useState(null);
  const castRowRef = useRef(null);

  useEffect(() => {
    getSeasonDetails(showId, seasonNumber).then((data) => {
      setSeason(data);
    });
  }, [showId, seasonNumber]);

  useEffect(() => {
    getAggregateCreditsShow(showId).then((data) => {
      setShowCredits(data);
    });
  }, [showId]);

  if (!season || !showCredits) {
    return <p>Caricamento...</p>;
  }

  const posterSrc = season.poster_path
    ? `${IMG_URL_LARGE}${season.poster_path}`
    : "https://placehold.co/300x450?text=No+Image";

  // Cast aggregato dello show (già con roles[0].character pronto) unito
  // agli eventuali attori specifici di questa stagione non già presenti,
  // così i protagonisti compaiono per primi e la lista è completa.
  const showCast = showCredits?.cast || [];
  const seasonGuests = season.credits?.cast || [];

  const showCastIds = new Set(showCast.map((member) => member.id));
  const extraGuests = seasonGuests
    .filter((member) => !showCastIds.has(member.id))
    .map((member) => ({
      ...member,
      roles: [{ character: member.character }],
    }));

  const cast = [...showCast, ...extraGuests];

  function scrollCastLeft() {
    castRowRef.current.scrollBy({ left: -400, behavior: "smooth" });
  }

  function scrollCastRight() {
    castRowRef.current.scrollBy({ left: 400, behavior: "smooth" });
  }

  return (
    <div className={styles.seasonPage}>
      <div className={styles.header}>
        <div className={styles.posterWrapper}>
          <img src={posterSrc} alt={season.name} className={styles.poster} />
          <Link to={`/show/${showId}`} className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
        </div>
        <div className={styles.info}>
          <h1>{season.name}</h1>
          <p className={styles.meta}>
            {season.episodes.length} episodi
            {season.air_date ? ` • ${season.air_date}` : ""}
          </p>
          <p>{season.overview || "Nessuna descrizione disponibile."}</p>
        </div>
      </div>

      <div className={styles.castSection}>
        <h2>Cast</h2>
        {cast.length > 0 ? (
          <div className={styles.castWrapper}>
            <button className={styles.arrowLeft} onClick={scrollCastLeft}>
              ‹
            </button>

            <div className={styles.castRow} ref={castRowRef}>
              {cast.slice(0, 50).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </div>

            <div className={styles.fade} />

            <button className={styles.arrowRight} onClick={scrollCastRight}>
              ›
            </button>
          </div>
        ) : (
          <p>Nessun attore disponibile.</p>
        )}
      </div>

      <div className={styles.episodesSection}>
        <h2>Episodi</h2>
        <div className={styles.episodesList}>
          {season.episodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              showId={showId}
              seasonNumber={seasonNumber}
              episode={episode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeasonDetail;