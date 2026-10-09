import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import Hero from "../../components/home/Hero";
import HomeSkeleton from "../../components/home/HomeSkeleton";
import SegmentedControl from "../../components/ui/SegmentedControl";
import styles from "./Home.module.css";
import { STREAMING_KEYWORDS } from "../../constants/streamingServices";

const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 350, name: "Apple TV+" },
  { id: 337, name: "Disney+" },
];

const MEDIA_OPTIONS = [
  { value: "tv", label: "Serie TV" },
  { value: "movie", label: "Film" },
];

// Ogni dato caricato ricorda per quale mediaType è stato scaricato: se non
// coincide con quello attuale, la Home sa che deve ancora aspettare.
function Home() {
  const { mediaType, setMediaType } = useMediaType();
  const [popular, setPopular] = useState({ type: null, shows: [] });
  const [byProvider, setByProvider] = useState({ type: null, shows: {} });
  const [icons, setIcons] = useState({ type: null, list: [] });
  const [genresData, setGenresData] = useState({ type: null, list: [] });
  const recommendations = useRecommendations(mediaType);
  const { forYou, genreRows, becauseRows } = recommendations;

  useEffect(() => {
    getPopularShows(mediaType).then((shows) => {
      setPopular({ type: mediaType, shows });
    });
  }, [mediaType]);

  useEffect(() => {
    async function loadProviderShows() {
      const results = await Promise.all(
        PROVIDERS.map((provider) => getTopByProvider(mediaType, provider.id)),
      );

      const shows = {};
      PROVIDERS.forEach((provider, index) => {
        shows[provider.id] = results[index];
      });

      setByProvider({ type: mediaType, shows });
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
      setIcons({ type: mediaType, list: matched });
    });
  }, [mediaType]);

  useEffect(() => {
    getGenres(mediaType).then((list) => {
      setGenresData({ type: mediaType, list });
    });
  }, [mediaType]);

  // La pagina si mostra solo quando tutto è arrivato: prima, gli skeleton.
  const ready =
    popular.type === mediaType &&
    byProvider.type === mediaType &&
    icons.type === mediaType &&
    genresData.type === mediaType &&
    !recommendations.loading;

  const genres = genresData.list;

  return (
    <div className={styles.homePage}>
      <div className={styles.mediaTypeToggleRow}>
        <SegmentedControl
          label="Cosa vuoi guardare"
          options={MEDIA_OPTIONS}
          value={mediaType}
          onChange={setMediaType}
        />
      </div>

      {!ready ? (
        <HomeSkeleton />
      ) : (
        <div className={styles.reveal}>
          <Hero key={mediaType} shows={popular.shows} mediaType={mediaType} />

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

          <ShowRow title="Popolari del momento" shows={popular.shows} />

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
              {icons.list.map((provider, index) => (
                <StreamingIcon key={index} provider={provider} />
              ))}
            </div>
          </div>

          {PROVIDERS.map((provider) => (
            <ShowRow
              key={provider.id}
              title={"Top 10 su " + provider.name}
              shows={byProvider.shows[provider.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
