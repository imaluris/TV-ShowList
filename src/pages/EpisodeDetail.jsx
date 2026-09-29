import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getEpisodeDetails,
  getAggregateCreditsShow,
  IMG_URL_LARGE,
} from "../services/tmdb";
import CastCard from "../components/CastCard";
import { ArrowLeft } from "lucide-react";
import styles from "./EpisodeDetail.module.css";

function EpisodeDetail() {
  const { showId, seasonNumber, episodeNumber } = useParams();
  const [episode, setEpisode] = useState(null);
  const [showCredits, setShowCredits] = useState(null);
  const mainCastRowRef = useRef(null);
  const guestCastRowRef = useRef(null);

  useEffect(() => {
    getEpisodeDetails(showId, seasonNumber, episodeNumber).then((data) => {
      setEpisode(data);
    });
  }, [showId, seasonNumber, episodeNumber]);

  useEffect(() => {
    getAggregateCreditsShow(showId).then((data) => {
      setShowCredits(data);
    });
  }, [showId]);

  if (!episode || !showCredits) {
    return <p>Caricamento...</p>;
  }

  const imageSrc = episode.still_path
    ? `${IMG_URL_LARGE}${episode.still_path}`
    : "https://placehold.co/800x450?text=No+Image";

  const dateFormatted = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Data non disponibile";

  const guestStars = episode.credits?.guest_stars || [];
  // Il cast aggregato dello show ha già member.roles[0].character pronto,
  // non serve trasformarlo (a differenza dei guest stars).
  const showCast = showCredits?.cast || [];

  // Riga 1: cast principale dello show + eventuali guest non già presenti
  // tra gli attori fissi, così i protagonisti compaiono per primi.
  const showCastIds = new Set(showCast.map((member) => member.id));
  const extraGuests = guestStars
    .filter((member) => !showCastIds.has(member.id))
    .map((member) => ({
      ...member,
      roles: [{ character: member.character }],
    }));

  const fullCast = [...showCast, ...extraGuests];

  // Riga 2: solo gli ospiti specifici di questo episodio.
  const guestCast = guestStars.map((member) => ({
    ...member,
    roles: [{ character: member.character }],
  }));

  function scrollRow(ref, direction) {
    ref.current.scrollBy({ left: direction * 400, behavior: "smooth" });
  }

  return (
    <div className={styles.episodePage}>
      <div className={styles.imageWrapper}>
        <img src={imageSrc} alt={episode.name} className={styles.image} />
        <Link
          to={`/show/${showId}/season/${seasonNumber}`}
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className={styles.info}>
        <h1>
          {episode.episode_number}. {episode.name}
        </h1>
        <p className={styles.meta}>
          {dateFormatted}
          {episode.vote_average > 0
            ? ` • ⭐ ${episode.vote_average.toFixed(1)}`
            : ""}
        </p>
        <p>{episode.overview || "Nessuna descrizione disponibile."}</p>
      </div>

      <div className={styles.castSection}>
        <h2>Cast</h2>
        {fullCast.length > 0 ? (
          <div className={styles.castWrapper}>
            <button
              className={styles.arrowLeft}
              onClick={() => scrollRow(mainCastRowRef, -1)}
            >
              ‹
            </button>

            <div className={styles.castRow} ref={mainCastRowRef}>
              {fullCast.slice(0, 50).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </div>

            <div className={styles.fade} />

            <button
              className={styles.arrowRight}
              onClick={() => scrollRow(mainCastRowRef, 1)}
            >
              ›
            </button>
          </div>
        ) : (
          <p>Nessun attore disponibile.</p>
        )}
      </div>

      <div className={styles.castSection}>
        <h2>Guest Appearance</h2>
        {guestCast.length > 0 ? (
          <div className={styles.castWrapper}>
            <button
              className={styles.arrowLeft}
              onClick={() => scrollRow(guestCastRowRef, -1)}
            >
              ‹
            </button>

            <div className={styles.castRow} ref={guestCastRowRef}>
              {guestCast.map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </div>

            <div className={styles.fade} />

            <button
              className={styles.arrowRight}
              onClick={() => scrollRow(guestCastRowRef, 1)}
            >
              ›
            </button>
          </div>
        ) : (
          <p>Nessun ospite disponibile per questo episodio.</p>
        )}
      </div>
    </div>
  );
}

export default EpisodeDetail;