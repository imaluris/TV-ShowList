import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import {
  getPopularShows,
  getTopByProvider,
  getWatchProviders,
  getGenres,
} from "../services/tmdb";
import ShowRow from "../components/ShowRow";
import StreamingIcon from "../components/StreamingIcon";
import styles from "./Home.module.css";
import { STREAMING_KEYWORDS } from "../constants/streamingServices";
import { Link } from "react-router-dom";

const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 350, name: "Apple TV+" },
  { id: 337, name: "Disney+" },
];

function Home() {
  const { currentUser } = useAuth();
  const [popularShows, setPopularShows] = useState([]);
  const [showsByProvider, setShowsByProvider] = useState({});
  const [streamingIcons, setStreamingIcons] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    getPopularShows().then((shows) => {
      setPopularShows(shows);
    });
  }, []);

  useEffect(() => {
    async function loadProviderShows() {
      const results = await Promise.all(
        PROVIDERS.map((provider) => getTopByProvider(provider.id)),
      );

      const byProvider = {};
      PROVIDERS.forEach((provider, index) => {
        byProvider[provider.id] = results[index];
      });

      setShowsByProvider(byProvider);
    }

    loadProviderShows();
  }, []);

  useEffect(() => {
    getWatchProviders().then((allProviders) => {
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
  }, []);

  console.log(streamingIcons);

  useEffect(() => {
    getGenres().then((data) => {
      setGenres(data);
    });
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Errore durante il logout:", err);
    }
  }

  return (
    <div className={styles.homePage}>
      <div>
        <button onClick={handleLogout}>Esci</button>

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
