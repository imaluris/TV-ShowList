import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMediaType } from "../../contexts/MediaTypeContext";
import {
  getPopularShows,
  getTopByProvider,
  getWatchProviders,
  getGenres,
  getShowsByAnyGenre,
} from "../../services/tmdb";
import { getPreferredGenres } from "../../services/profile";
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
  const { currentUser } = useAuth();
  const { mediaType, setMediaType } = useMediaType();
  const [popularShows, setPopularShows] = useState([]);
  const [showsByProvider, setShowsByProvider] = useState({});
  const [streamingIcons, setStreamingIcons] = useState([]);
  const [genres, setGenres] = useState([]);
  const [recommended, setRecommended] = useState([]);

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

  // "Consigliati per te": titoli di uno qualsiasi dei generi preferiti salvati.
  // Se l'utente non ne ha scelti, la riga resta vuota (ShowRow non mostra nulla).
  useEffect(() => {
    let cancelled = false;
    setRecommended([]);

    async function loadRecommended() {
      try {
        const genreIds = await getPreferredGenres(currentUser.uid, mediaType);
        if (genreIds.length === 0) return;

        const shows = await getShowsByAnyGenre(mediaType, genreIds);
        if (!cancelled) setRecommended(shows);
      } catch (err) {
        console.error("Impossibile caricare i consigliati:", err);
      }
    }

    loadRecommended();
    return () => {
      cancelled = true;
    };
  }, [currentUser.uid, mediaType]);

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

        <ShowRow title="Consigliati per te" shows={recommended} />

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