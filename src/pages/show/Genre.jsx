import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { discoverShowsByGenre, getGenres } from "../../services/tmdb";
import { useMediaType } from "../../contexts/MediaTypeContext";
import ShowCard from "../../components/show/ShowCard";
import SkeletonGrid from "../../components/ui/SkeletonGrid";
import GenreFilterModal from "../../components/layout/GenreFilterModal";
import styles from "./Genre.module.css";

function Genre() {
  const { id } = useParams();
  const { mediaType, isMovie } = useMediaType();
  const [shows, setShows] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [genreExists, setGenreExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const presetProviderId = searchParams.get("provider") || "";
  const [filters, setFilters] = useState(
    presetProviderId ? { providerId: presetProviderId } : {},
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Il nome del genere non dipende dai filtri: basta caricarlo una volta
  // (ma va ricaricato se cambia mediaType, perché gli ID dei generi sono
  // diversi tra film e serie TV)
  useEffect(() => {
    getGenres(mediaType).then((genresData) => {
      const genre = genresData.find((g) => String(g.id) === String(id));
      setGenreName(genre ? genre.name : "");
      setGenreExists(Boolean(genre));
    });
  }, [id, mediaType]);

  // Le serie/i film invece vanno ricaricati ogni volta che cambiano genere,
  // filtri o mediaType — ma solo se il genere esiste davvero per il
  // mediaType corrente (vedi genreExists sopra)
  useEffect(() => {
    if (!genreExists) {
      setLoading(false);
      return;
    }

    setLoading(true);

    discoverShowsByGenre(mediaType, id, filters, 1).then(
      ({ results, totalPages }) => {
        setShows(results);
        setTotalPages(totalPages);
        setPage(1);
        setLoading(false);
      },
    );
  }, [id, filters, mediaType, genreExists]);

  function loadMore() {
    const nextPage = page + 1;

    discoverShowsByGenre(mediaType, id, filters, nextPage).then(
      ({ results, totalPages }) => {
        setShows((prev) => [...prev, ...results]);
        setTotalPages(totalPages);
        setPage(nextPage);
      },
    );
  }

  return (
    <div className={styles.genrePage}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backButton}>
          ‹
        </Link>

        <h1 className={styles.title}>{genreName || "Genere"}</h1>

        <button
          type="button"
          className={styles.filterButton}
          onClick={() => setIsModalOpen(true)}
        >
          Filtri
        </button>
      </div>

      {!genreExists ? (
        <p>
          Questo genere non esiste per {isMovie ? "i film" : "le serie TV"}.{" "}
          <Link to="/">Torna alla Home</Link>.
        </p>
      ) : loading ? (
        <SkeletonGrid />
      ) : shows.length === 0 ? (
        <p>
          {isMovie
            ? "Nessun film trovato con questi filtri."
            : "Nessuna serie TV trovata con questi filtri."}
        </p>
      ) : (
        <div className={styles.grid}>
          {shows.map((show) => (
            <div key={show.id} className={styles.gridItem}>
              <ShowCard show={show} />
            </div>
          ))}
        </div>
      )}
      {!loading && page < totalPages && (
        <button className={styles.loadMoreButton} onClick={loadMore}>
          Carica altri
        </button>
      )}
      <GenreFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={setFilters}
      />
    </div>
  );
}

export default Genre;