import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getShowDetails,
  getVideoShow,
  getShowsByGenres,
  getAggregateCreditsShow,
  IMG_URL_LARGE,
} from "../services/tmdb";
import { getTitle } from "../utils/media";
import styles from "./ShowDetail.module.css";
import ShowRow from "../components/ShowRow";
import SeasonCard from "../components/SeasonCard";
import CastCard from "../components/CastCard";
import VideoCard from "../components/VideoCard";
import LibraryStatusButtons from "../components/LibraryStatusButtons";
import { ArrowLeft } from "lucide-react";

function ShowDetail() {
  const { mediaType, id } = useParams();
  const isMovie = mediaType === "movie";
  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [suggeriti, setSuggeriti] = useState([]);
  const [showAllSeasons, setShowAllSeasons] = useState(false);
  const castRowRef = useRef(null);

  useEffect(() => {
    getShowDetails(mediaType, id).then((data) => {
      setShow(data);
    });
  }, [mediaType, id]);

  useEffect(() => {
    getAggregateCreditsShow(mediaType, id).then((data) => {
      setCredits(data);
    });
  }, [mediaType, id]);

  useEffect(() => {
    getVideoShow(mediaType, id).then((data) => {
      setVideos(data);
    });
  }, [mediaType, id]);

  useEffect(() => {
    if (!show) return;

    async function loadSuggested() {
      const genreIds = show.genres.map((g) => g.id);

      let results = await getShowsByGenres(mediaType, genreIds);
      results = results.filter((s) => s.id !== show.id);

      if (results.length === 0 && genreIds.length > 1) {
        results = await getShowsByGenres(mediaType, [genreIds[0]]);
        results = results.filter((s) => s.id !== show.id);
      }

      setSuggeriti(results);
    }

    loadSuggested();
  }, [show, mediaType]);

  if (!show) {
    return <p>Caricamento...</p>;
  }

  function scrollCastLeft() {
    castRowRef.current.scrollBy({ left: -400, behavior: "smooth" });
  }

  function scrollCastRight() {
    castRowRef.current.scrollBy({ left: 400, behavior: "smooth" });
  }

  const title = getTitle(show);

  return (
    <div className={styles.detailPage}>
      <div className={styles.header}>
        <div className={styles.posterWrapper}>
          <img
            className={styles.poster}
            src={show.poster_path ? `${IMG_URL_LARGE}${show.poster_path}` : ""}
            alt={title}
          />
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
        </div>
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1>{title}</h1>
            <LibraryStatusButtons
              mediaType={mediaType}
              tmdbId={show.id}
              title={title}
              posterPath={show.poster_path}
            />
          </div>

          <p className={styles.meta}>
            {show.genres.map((g) => g.name).join(", ")} • ⭐ {show.vote_average}
            {show.vote_count > 0 ? ` (${show.vote_count} voti)` : ""}
          </p>
          <p>{show.overview}</p>

          <div className={styles.details}>
            <p>
              <strong>Lingua originale:</strong> {show.original_language}
            </p>
            {isMovie ? (
              <>
                <p>
                  <strong>Data di uscita:</strong> {show.release_date}
                </p>
                <p>
                  <strong>Durata:</strong>{" "}
                  {show.runtime ? `${show.runtime} minuti` : "Non disponibile"}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Prima trasmissione:</strong> {show.first_air_date}
                </p>
                <p>
                  <strong>Numero di stagioni:</strong> {show.number_of_seasons}
                </p>
                <p>
                  <strong>Numero di episodi:</strong> {show.number_of_episodes}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.productionSection}>
        <h2>Produzione</h2>
        <p>
          <strong>Compagnie di produzione:</strong>{" "}
          {show.production_companies.map((c) => c.name).join(", ")}
        </p>
        <p>
          <strong>Nazioni di produzione:</strong>{" "}
          {show.production_countries.map((c) => c.name).join(", ")}
        </p>
      </div>

      {!isMovie && (
        <div className={styles.networkSection}>
          <h2>Reti</h2>
          <p>
            <strong>Reti di trasmissione:</strong>{" "}
            {show.networks.map((n) => n.name).join(", ")}
          </p>
        </div>
      )}

      <div className={styles.castSection}>
        <h2>Cast</h2>
        {credits && credits.cast.length > 0 ? (
          <div className={styles.castWrapper}>
            <button className={styles.arrowLeft} onClick={scrollCastLeft}>
              ‹
            </button>

            <div className={styles.castRow} ref={castRowRef}>
              {credits.cast.slice(0, 50).map((member) => (
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

      <div className={styles.videoSection}>
        <h2>Video</h2>
        <div className={styles.videoRow}>
          {videos &&
            videos
              .filter((v) => v.type === "Trailer")
              .map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      </div>

      {!isMovie && (
        <div className={styles.seasonsSection}>
          <h2>Stagioni</h2>
          {(() => {
            const seasonsSorted = show.seasons
              .filter((season) => season.season_number !== 0)
              .slice()
              .reverse();

            const seasonsToShow = showAllSeasons
              ? seasonsSorted
              : seasonsSorted.slice(0, 3);

            return (
              <div className={styles.seasonsColumn}>
                {seasonsToShow.map((season) => (
                  <SeasonCard
                    key={season.id}
                    showId={show.id}
                    mediaType={mediaType}
                    title={title}
                    posterPath={show.poster_path}
                    season={season}
                  />
                ))}

                {!showAllSeasons && seasonsSorted.length > 3 && (
                  <button
                    className={styles.showMoreButton}
                    onClick={() => setShowAllSeasons(true)}
                  >
                    Vedi altre ▼
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className={styles.similarSection}>
        <ShowRow
          title={isMovie ? "Film simili" : "Serie tv simili"}
          shows={suggeriti}
        />
      </div>
    </div>
  );
}

export default ShowDetail;