import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getWatchProviders,
  getTopByProvider,
  getNewShowsByProvider,
  getExclusivesByNetwork,
  getGenres,
  IMG_URL,
} from "../../services/tmdb";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { STREAMING_KEYWORDS } from "../../constants/streamingServices";
import ShowRow from "../../components/show/ShowRow";
import styles from "./Provider.module.css";

function Provider() {
  const { id } = useParams();
  const { mediaType, isMovie } = useMediaType();
  const [providerInfo, setProviderInfo] = useState(null);
  const [popular, setPopular] = useState([]);
  const [newShows, setNewShows] = useState([]);
  const [exclusives, setExclusives] = useState([]);
  const [networkId, setNetworkId] = useState(null);
  const [genres, setGenres] = useState([]);

  // Nome/logo della piattaforma, e a quale network TMDB corrisponde (per le esclusive)
  useEffect(() => {
    getWatchProviders(mediaType).then((allProviders) => {
      const found = allProviders.find((p) => String(p.provider_id) === id);
      setProviderInfo(found || null);

      if (found) {
        const match = STREAMING_KEYWORDS.find(({ keyword }) =>
          found.provider_name.toLowerCase().includes(keyword),
        );
        setNetworkId(match ? match.network : null);
      }
    });
  }, [id, mediaType]);

  useEffect(() => {
    getTopByProvider(mediaType, id).then(setPopular);
  }, [id, mediaType]);

  useEffect(() => {
    getNewShowsByProvider(mediaType, id).then(setNewShows);
  }, [id, mediaType]);

  useEffect(() => {
    // Le "esclusive" via network TMDB esistono solo per le serie TV
    // (vedi nota in getExclusivesByNetwork, tmdb.js)
    if (isMovie || !networkId) {
      setExclusives([]);
      return;
    }
    getExclusivesByNetwork(networkId).then(setExclusives);
  }, [networkId, isMovie]);

  useEffect(() => {
    getGenres(mediaType).then(setGenres);
  }, [mediaType]);

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

      {!isMovie && networkId && exclusives.length > 0 && (
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