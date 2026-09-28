import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { discoverShowsByGenre, getGenres } from "../services/tmdb";
import ShowCard from "../components/ShowCard";
import GenreFilterModal from "../components/GenreFilterModal";
import styles from "./Genre.module.css";

function Genre() {
  const { id } = useParams();
  const [shows, setShows] = useState([]);
  const [genreName, setGenreName] = useState("");
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
  useEffect(() => {
    getGenres().then((genresData) => {
      const genre = genresData.find((g) => String(g.id) === String(id));
      setGenreName(genre ? genre.name : "");
    });
  }, [id]);

  // Le serie invece vanno ricaricate ogni volta che cambiano genere o filtri
  useEffect(() => {
    setLoading(true);

    discoverShowsByGenre(id, filters, 1).then(({ results, totalPages }) => {
      setShows(results);
      setTotalPages(totalPages);
      setPage(1);
      setLoading(false);
    });
  }, [id, filters]);

  function loadMore() {
    const nextPage = page + 1;

    discoverShowsByGenre(id, filters, nextPage).then(
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

      {loading ? (
        <p>Caricamento...</p>
      ) : shows.length === 0 ? (
        <p>Nessuna serie TV trovata con questi filtri.</p>
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
