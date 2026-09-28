import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getWatchProviders,
  getTopByProvider,
  getNewShowsByProvider,
  getExclusivesByNetwork,
  getGenres,
  IMG_URL,
} from "../services/tmdb";
import { STREAMING_KEYWORDS } from "../constants/streamingServices";
import ShowRow from "../components/ShowRow";
import styles from "./Provider.module.css";

function Provider() {
  const { id } = useParams();
  const [providerInfo, setProviderInfo] = useState(null);
  const [popular, setPopular] = useState([]);
  const [newShows, setNewShows] = useState([]);
  const [exclusives, setExclusives] = useState([]);
  const [networkId, setNetworkId] = useState(null);
  const [genres, setGenres] = useState([]);

  // Nome/logo della piattaforma, e a quale network TMDB corrisponde (per le esclusive)
  useEffect(() => {
    getWatchProviders().then((allProviders) => {
      const found = allProviders.find((p) => String(p.provider_id) === id);
      setProviderInfo(found || null);

      if (found) {
        const match = STREAMING_KEYWORDS.find(({ keyword }) =>
          found.provider_name.toLowerCase().includes(keyword),
        );
        setNetworkId(match ? match.network : null);
      }
    });
  }, [id]);

  useEffect(() => {
    getTopByProvider(id).then(setPopular);
  }, [id]);

  useEffect(() => {
    getNewShowsByProvider(id).then(setNewShows);
  }, [id]);

  useEffect(() => {
    if (!networkId) return;
    getExclusivesByNetwork(networkId).then(setExclusives);
  }, [networkId]);

  useEffect(() => {
    getGenres().then(setGenres);
  }, []);

  return (
    <div className={styles.providerPage}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backButton}>
          ‹
        </Link>

        <div className={styles.providerHeader}>
          {providerInfo?.logo_path ? (
            <img
              src={`${IMG_URL}${providerInfo.logo_path}`}
              alt={providerInfo.provider_name}
              className={styles.logo}
            />
          ) : null}
          <h1 className={styles.title}>
            {providerInfo ? providerInfo.provider_name : "Piattaforma"}
          </h1>
        </div>
      </div>

      <ShowRow title="Popolari del momento" shows={popular} />
      <ShowRow title="Nuove della settimana" shows={newShows} />

      {networkId && exclusives.length > 0 && (
        <ShowRow title="Esclusive" shows={exclusives} />
      )}

      <div className={styles.genresSection}>
        <h2>Generi</h2>
        <div className={styles.genresGrid}>
          {genres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}?provider=${id}`}
              className={styles.genreButton}
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Provider;