import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getWatchProviders, searchCompany } from "../../services/tmdb";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { STREAMING_KEYWORDS } from "../../constants/streamingServices";
import styles from "./GenreFilterModal.module.css";

const SORT_OPTIONS_TV = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Average rating" },
  { value: "first_air_date.desc", label: "Release date (newest)" },
  { value: "name.asc", label: "Name (A-Z)" },
];

const SORT_OPTIONS_MOVIE = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Average rating" },
  { value: "primary_release_date.desc", label: "Release date (newest)" },
  { value: "title.asc", label: "Name (A-Z)" },
];

// Paesi di produzione selezionabili (codice ISO usato da TMDB).
const COUNTRIES = [
  { value: "IT", label: "Italy" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "IN", label: "India" },
  { value: "CN", label: "China" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "SE", label: "Sweden" },
  { value: "DK", label: "Denmark" },
  { value: "TR", label: "Turkey" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
];

function GenreFilterModal({ isOpen, onClose, onApply }) {
  const { mediaType, isMovie } = useMediaType();
  const sortOptions = isMovie ? SORT_OPTIONS_MOVIE : SORT_OPTIONS_TV;

  const [sortBy, setSortBy] = useState("popularity.desc");
  // Se l'ordinamento scelto non esiste per il tipo corrente (es. "Nome" di
  // una serie passando ai film) si ripiega sulla popolarità.
  const activeSortBy = sortOptions.some((opt) => opt.value === sortBy)
    ? sortBy
    : "popularity.desc";
  const [minVote, setMinVote] = useState("");
  const [yearMode, setYearMode] = useState("exact"); // "exact" oppure "range"
  const [year, setYear] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [providerId, setProviderId] = useState("");
  const [country, setCountry] = useState("");
  const [providers, setProviders] = useState([]);
  const [companyQuery, setCompanyQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [companyError, setCompanyError] = useState("");

  // Recupera gli ID reali delle piattaforme da TMDB solo quando la modal si apre
  useEffect(() => {
    if (!isOpen) return;

    getWatchProviders(mediaType).then((allProviders) => {
      const matched = STREAMING_KEYWORDS.map(({ label, keyword }) => {
        const found = allProviders.find((p) =>
          p.provider_name.toLowerCase().includes(keyword),
        );
        return found ? { id: found.provider_id, name: label } : null;
      }).filter(Boolean); // scarta le piattaforme non trovate su TMDB

      setProviders(matched);
    });
  }, [isOpen, mediaType]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setCompanyError("");

    let companyId = "";

    if (companyQuery.trim()) {
      setIsSearching(true);
      const results = await searchCompany(companyQuery.trim());
      setIsSearching(false);

      if (results.length === 0) {
        setCompanyError("No company found with that name.");
        return;
      }

      companyId = results[0].id;
    }

    const yearFilters = yearMode === "exact" ? { year } : { yearFrom, yearTo };

    onApply({ sortBy: activeSortBy, minVote, providerId, country, companyId, ...yearFilters });
    onClose();
  }

  function handleReset() {
    setSortBy("popularity.desc");
    setMinVote("");
    setYearMode("exact");
    setYear("");
    setYearFrom("");
    setYearTo("");
    setProviderId("");
    setCountry("");
    setCompanyQuery("");
    setCompanyError("");
    onApply({});
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={isMovie ? "Filter movies" : "Filter TV shows"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{isMovie ? "Filter movies" : "Filter TV shows"}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
          <label className={styles.field}>
            Sort by
            <select value={activeSortBy} onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Minimum rating
            <select
              value={minVote}
              onChange={(e) => setMinVote(e.target.value)}
            >
              <option value="">Any</option>
              <option value="5">5+</option>
              <option value="6">6+</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
              <option value="9">9+</option>
            </select>
          </label>

          <div className={styles.field}>
            <span>Release year</span>

            <div className={styles.yearModeToggle}>
              <label>
                <input
                  type="radio"
                  name="yearMode"
                  checked={yearMode === "exact"}
                  onChange={() => setYearMode("exact")}
                />
                Exact year
              </label>
              <label>
                <input
                  type="radio"
                  name="yearMode"
                  checked={yearMode === "range"}
                  onChange={() => setYearMode("range")}
                />
                Range
              </label>
            </div>

            {yearMode === "exact" ? (
              <input
                type="number"
                placeholder="e.g. 2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            ) : (
              <div className={styles.yearRange}>
                <input
                  type="number"
                  placeholder="From (e.g. 2018)"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="To (empty = today)"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                />
              </div>
            )}
          </div>

          <label className={styles.field}>
            Streaming platform
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
            >
              <option value="">All</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Production country
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">All</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Production company
            <input
              type="text"
              placeholder="e.g. Netflix, HBO..."
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
            />
          </label>

          {companyError && <p className={styles.error}>{companyError}</p>}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Reset filters
            </button>
            <button
              type="submit"
              disabled={isSearching}
              className={styles.applyButton}
            >
              {isSearching ? "Searching..." : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenreFilterModal;