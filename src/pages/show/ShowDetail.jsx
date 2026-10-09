import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getShowDetails,
  getVideoShow,
  getShowsByGenres,
  getAggregateCreditsShow,
} from "../../services/tmdb";
import { useAuth } from "../../contexts/AuthContext";
import { refreshLibrarySeasons } from "../../services/firestore";
import { getTitle } from "../../utils/media";
import styles from "./ShowDetail.module.css";
import ShowRow from "../../components/show/ShowRow";
import SeasonCard from "../../components/show/SeasonCard";
import CastCard from "../../components/show/CastCard";
import VideoCard from "../../components/show/VideoCard";
import LibraryStatusButtons from "../../components/library/LibraryStatusButtons";
import { Star } from "lucide-react";
import DetailSkeleton from "../../components/ui/DetailSkeleton";
import DetailHero from "../../components/ui/DetailHero";
import Section from "../../components/ui/Section";
import FactGrid from "../../components/ui/FactGrid";
import Chips from "../../components/ui/Chips";
import Rail from "../../components/ui/Rail";

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ShowDetail() {
  const { mediaType, id } = useParams();
  const { currentUser } = useAuth();
  const isMovie = mediaType === "movie";
  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState(null);
  const [suggeriti, setSuggeriti] = useState([]);
  const [showAllSeasons, setShowAllSeasons] = useState(false);

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

  // Se la serie è già in libreria, allinea le stagioni salvate a quelle
  // attuali di TMDB (nuove stagioni o nuovi episodi).
  useEffect(() => {
    if (!show || !currentUser || mediaType !== "tv") return;

    refreshLibrarySeasons(currentUser.uid, mediaType, show.id, show.seasons);
  }, [show, currentUser, mediaType]);

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
    return <DetailSkeleton />;
  }

  const title = getTitle(show);

  // Stagioni "vere" (senza la 0, gli speciali). Vengono passate ai
  // componenti che salvano su Firestore, così il documento della serie
  // sa quanti episodi ha in totale.
  const seasons = !isMovie
    ? show.seasons.filter((season) => season.season_number !== 0)
    : undefined;

  const year = (show.release_date || show.first_air_date || "").slice(0, 4);
  const runtime = show.runtime
    ? `${show.runtime} min`
    : show.episode_run_time?.[0]
      ? `${show.episode_run_time[0]} min`
      : "";
  const trailers = (videos || []).filter((v) => v.type === "Trailer");

  const facts = [
    { label: "Lingua originale", value: show.original_language?.toUpperCase() },
    isMovie
      ? { label: "Data di uscita", value: formatDate(show.release_date) }
      : { label: "Prima trasmissione", value: formatDate(show.first_air_date) },
    isMovie
      ? { label: "Durata", value: runtime }
      : { label: "Stagioni", value: show.number_of_seasons },
    !isMovie && { label: "Episodi", value: show.number_of_episodes },
    { label: "Produzione", value: show.production_companies.map((c) => c.name).join(", ") },
    { label: "Paesi", value: show.production_countries.map((c) => c.name).join(", ") },
    !isMovie && { label: "Reti", value: show.networks.map((n) => n.name).join(", ") },
  ].filter(Boolean);

  const seasonsSorted = seasons ? seasons.slice().reverse() : [];
  const seasonsToShow = showAllSeasons ? seasonsSorted : seasonsSorted.slice(0, 3);

  return (
    <div className={styles.page}>
      <DetailHero
        backdrop={show.backdrop_path}
        poster={show.poster_path}
        title={title}
        backTo="/"
        meta={
          <Chips
            items={[
              show.vote_average > 0 && {
                label: show.vote_average.toFixed(1),
                accent: true,
                icon: <Star size={13} fill="currentColor" />,
              },
              year,
              runtime,
              ...show.genres.slice(0, 4).map((g) => g.name),
            ]}
          />
        }
      >
        <LibraryStatusButtons
          mediaType={mediaType}
          tmdbId={show.id}
          title={title}
          posterPath={show.poster_path}
          seasons={seasons}
        />
      </DetailHero>

      <div className={styles.container}>
        {show.overview && <p className={styles.overview}>{show.overview}</p>}

        <Section title="Informazioni">
          <FactGrid facts={facts} />
        </Section>

        <Section title="Cast">
          {credits && credits.cast.length > 0 ? (
            <Rail>
              {credits.cast.slice(0, 50).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </Rail>
          ) : (
            <p className={styles.empty}>Nessun attore disponibile.</p>
          )}
        </Section>

        {trailers.length > 0 && (
          <Section title="Trailer">
            <Rail>
              {trailers.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </Rail>
          </Section>
        )}

        {!isMovie && (
          <Section title="Stagioni" aside={`${seasonsSorted.length} in totale`}>
            <div className={styles.seasonsColumn}>
              {seasonsToShow.map((season) => (
                <SeasonCard
                  key={season.id}
                  showId={show.id}
                  mediaType={mediaType}
                  title={title}
                  posterPath={show.poster_path}
                  seasons={seasons}
                  season={season}
                />
              ))}

              {!showAllSeasons && seasonsSorted.length > 3 && (
                <button
                  type="button"
                  className={styles.showMoreButton}
                  onClick={() => setShowAllSeasons(true)}
                >
                  Mostra tutte le stagioni
                </button>
              )}
            </div>
          </Section>
        )}

        <ShowRow
          title={isMovie ? "Film simili" : "Serie TV simili"}
          shows={suggeriti}
        />
      </div>
    </div>
  );
}

export default ShowDetail;
