import { useState, useEffect } from "react";
import { useMediaType } from "../../contexts/MediaTypeContext";
import {
  getPopularShows,
  getTopByProvider,
  getWatchProviders,
  getGenres,
} from "../../services/tmdb";
import { useRecommendations } from "../../hooks/useRecommendations";
import ShowRow from "../../components/show/ShowRow";
import StreamingIcon from "../../components/show/StreamingIcon";
import styles from "./Home.module.css";
import { STREAMING_KEYWORDS } from "../../constants/streamingServices";
import { Link } from "react-router-dom";

const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 350, name: "Apple TV+" },
  { id: 337, name: "Disney+" },
];

function Home() {
  const { mediaType, setMediaType } = useMediaType();
  const [popularShows, setPopularShows] = useState([]);
  const [showsByProvider, setShowsByProvider] = useState({});
  const [streamingIcons, setStreamingIcons] = useState([]);
  const [genres, setGenres] = useState([]);
  const { forYou, genreRows, becauseRows } = useRecommendations(mediaType);

  useEffect(() => {
    getPopularShows(mediaType).then((shows) => {
      setPopularShows(shows);
    });
  }, [mediaType]);

  useEffect(() => {
    async function loadProviderShows() {
      const results = await Promise.all(
        PROVIDERS.map((provider) => getTopByProvider(mediaType, provider.id)),
      );

      const byProvider = {};
      PROVIDERS.forEach((provider, index) => {
        byProvider[provider.id] = results[index];
      });

      setShowsByProvider(byProvider);
    }

    loadProviderShows();
  }, [mediaType]);

  useEffect(() => {
    getWatchProviders(mediaType).then((allProviders) => {
      const matched = STREAMING_KEYWORDS.map(({ label, keyword }) => {
        const found = allProviders.find((p) =>
          p.provider_name.toLowerCase().includes(keyword),
        );
        return found
          ? { ...found, provider_name: label }
          : { provider_name: label, provider_id: null, logo_path: null };
      });
      setStreamingIcons(matched);
    });
  }, [mediaType]);

  useEffect(() => {
    getGenres(mediaType).then((data) => {
      setGenres(data);
    });
  }, [mediaType]);

  return (
    <div className={styles.homePage}>
      <div>
        <div className={styles.mediaTypeToggleRow}>
          <div className={styles.mediaTypeToggle}>
            <button
              type="button"
              className={
                mediaType === "tv"
                  ? styles.mediaTypeButtonActive
                  : styles.mediaTypeButton
              }
              onClick={() => setMediaType("tv")}
            >
              Serie TV
            </button>
            <button
              type="button"
              className={
                mediaType === "movie"
                  ? styles.mediaTypeButtonActive
                  : styles.mediaTypeButton
              }
              onClick={() => setMediaType("movie")}
            >
              Film
            </button>
          </div>
        </div>

        <ShowRow title="Consigliati per te" shows={forYou} />

        {becauseRows.map((row) => (
          <ShowRow
            key={row.id}
            title={`Perché hai visto ${row.title}`}
            shows={row.shows}
          />
        ))}

        {genreRows.map((row) => {
          const genre = genres.find((g) => g.id === row.id);
          return (
            <ShowRow
              key={row.id}
              title={genre ? `Perché ti piace ${genre.name}` : "Dai tuoi generi preferiti"}
              shows={row.shows}
            />
          );
        })}

        <ShowRow title="Popolari del momento" shows={popularShows} />

        <div className={styles.genresSection}>
          <h2>Generi</h2>
          <div className={styles.genresWrapper}>
            <div className={styles.genresGrid}>
              {genres.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/genre/${genre.id}`}
                  className={styles.genreButton}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
            <div className={styles.fade} />
          </div>
        </div>

        <div className={styles.streamingSection}>
          <h2>Piattaforme streaming</h2>
          <div className={styles.streamingGrid}>
            {streamingIcons.map((provider, index) => (
              <StreamingIcon key={index} provider={provider} />
            ))}
          </div>
        </div>

        {PROVIDERS.map((provider) => (
          <ShowRow
            key={provider.id}
            title={"Top 10 su " + provider.name}
            shows={showsByProvider[provider.id] || []}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;