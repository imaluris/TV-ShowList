import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getShowDetails,
  getCreditsShow,
  getVideoShow,
  getShowsByGenres,
  IMG_URL,
} from "../services/tmdb";
import styles from "./ShowDetail.module.css";
import ShowRow from "../components/ShowRow";
import SeasonCard from "../components/SeasonCard";

function ShowDetail() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [suggeriti, setSuggeriti] = useState([]);
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  useEffect(() => {
    getShowDetails(id).then((data) => {
      setShow(data);
    });
  }, [id]);

  useEffect(() => {
    getCreditsShow(id).then((data) => {
      setCredits(data);
    });
  }, [id]);

  useEffect(() => {
    getVideoShow(id).then((data) => {
      setVideos(data);
    });
  }, [id]);

  useEffect(() => {
    if (!show) return;

    async function loadSuggested() {
      const genreIds = show.genres.map((g) => g.id);

      let results = await getShowsByGenres(genreIds);
      results = results.filter((s) => s.id !== show.id);

      if (results.length === 0 && genreIds.length > 1) {
        results = await getShowsByGenres([genreIds[0]]);
        results = results.filter((s) => s.id !== show.id);
      }

      setSuggeriti(results);
    }

    loadSuggested();
  }, [show]);

  if (!show) {
    return <p>Caricamento...</p>;
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.header}>
        <img
          className={styles.poster}
          src={show.poster_path ? `${IMG_URL}${show.poster_path}` : ""}
          alt={show.name}
        />
        <div className={styles.info}>
          <h1>{show.name}</h1>
          <p className={styles.meta}>
            {show.genres.map((g) => g.name).join(", ")} • ⭐ {show.vote_average}
            {show.vote_count > 0 ? ` (${show.vote_count} voti)` : ""}
          </p>
          <p>{show.overview}</p>
        </div>
      </div>
      <div className={styles.details}>
        <p>
          <strong>Lingua originale:</strong> {show.original_language}
        </p>
        <p>
          <strong>Prima trasmissione:</strong> {show.first_air_date}
        </p>
        <p>
          <strong>Numero di stagioni:</strong> {show.number_of_seasons}
        </p>
        <p>
          <strong>Numero di episodi:</strong> {show.number_of_episodes}
        </p>
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

      <div className={styles.networkSection}>
        <h2>Reti</h2>
        <p>
          <strong>Reti di trasmissione:</strong>{" "}
          {show.networks.map((n) => n.name).join(", ")}
        </p>
      </div>

      <div className={styles.castSection}>
        <h2>Cast</h2>
        {credits && credits.cast.length > 0 ? (
          <ul>
            {credits.cast.slice(0, 10).map((member) => (
              <li key={member.id}>
                <strong>{member.name}</strong> - {member.character}
              </li>
            ))}
          </ul>
        ) : (
          <p> Nessun attore disponibile.</p>
        )}
      </div>

      <div className={styles.videoSection}>
        <h2>Video</h2>
        {videos &&
          videos
            .filter((v) => v.type === "Trailer")
            .map((video) => (
              <iframe
                key={video.id}
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${video.key}`}
                title={video.name}
                allowFullScreen
              />
            ))}
      </div>

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
                <SeasonCard key={season.id} showId={show.id} season={season} />
              ))}

              {!showAllSeasons && seasonsSorted.length > 3 && (
                <button onClick={() => setShowAllSeasons(true)}>
                  Vedi altre ▼
                </button>
              )}
            </div>
          );
        })()}
      </div>

      <div className={styles.similarSection}>
        <ShowRow title="Serie tv simili" shows={suggeriti} />
      </div>
    </div>
  );
}

export default ShowDetail;
