import { useState, useEffect } from "react";
import { getWatchProviders, searchCompany } from "../../services/tmdb";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { STREAMING_KEYWORDS } from "../../constants/streamingServices";
import styles from "./GenreFilterModal.module.css";

const SORT_OPTIONS_TV = [
  { value: "popularity.desc", label: "Popolarità" },
  { value: "vote_average.desc", label: "Voto medio" },
  { value: "first_air_date.desc", label: "Data di uscita (più recenti)" },
  { value: "name.asc", label: "Nome (A-Z)" },
];

const SORT_OPTIONS_MOVIE = [
  { value: "popularity.desc", label: "Popolarità" },
  { value: "vote_average.desc", label: "Voto medio" },
  { value: "primary_release_date.desc", label: "Data di uscita (più recenti)" },
  { value: "title.asc", label: "Nome (A-Z)" },
];

// Paesi di produzione selezionabili (codice ISO usato da TMDB).
const COUNTRIES = [
  { value: "IT", label: "Italia" },
  { value: "US", label: "Stati Uniti" },
  { value: "GB", label: "Regno Unito" },
  { value: "FR", label: "Francia" },
  { value: "DE", label: "Germania" },
  { value: "ES", label: "Spagna" },
  { value: "JP", label: "Giappone" },
  { value: "KR", label: "Corea del Sud" },
  { value: "IN", label: "India" },
  { value: "CN", label: "Cina" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "SE", label: "Svezia" },
  { value: "DK", label: "Danimarca" },
  { value: "TR", label: "Turchia" },
  { value: "MX", label: "Messico" },
  { value: "BR", label: "Brasile" },
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
        setCompanyError("Nessuna compagnia trovata con questo nome.");
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{isMovie ? "Filtra film" : "Filtra serie TV"}</h2>

        <form onSubmit={handleSubmit}>
          <label className={styles.field}>
            Ordina per
            <select value={activeSortBy} onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Voto minimo
            <select
              value={minVote}
              onChange={(e) => setMinVote(e.target.value)}
            >
              <option value="">Qualsiasi</option>
              <option value="5">5+</option>
              <option value="6">6+</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
              <option value="9">9+</option>
            </select>
          </label>

          <div className={styles.field}>
            <span>Anno di uscita</span>

            <div className={styles.yearModeToggle}>
              <label>
                <input
                  type="radio"
                  name="yearMode"
                  checked={yearMode === "exact"}
                  onChange={() => setYearMode("exact")}
                />
                Anno preciso
              </label>
              <label>
                <input
                  type="radio"
                  name="yearMode"
                  checked={yearMode === "range"}
                  onChange={() => setYearMode("range")}
                />
                Intervallo
              </label>
            </div>

            {yearMode === "exact" ? (
              <input
                type="number"
                placeholder="es. 2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            ) : (
              <div className={styles.yearRange}>
                <input
                  type="number"
                  placeholder="Dal (es. 2018)"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Al (vuoto = ad oggi)"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                />
              </div>
            )}
          </div>

          <label className={styles.field}>
            Piattaforma streaming
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
            >
              <option value="">Tutte</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Paese di produzione
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Tutti</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            Compagnia di produzione
            <input
              type="text"
              placeholder="es. Netflix, HBO..."
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
            />
          </label>

          {companyError && <p className={styles.error}>{companyError}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Azzera filtri
            </button>
            <button
              type="submit"
              disabled={isSearching}
              className={styles.applyButton}
            >
              {isSearching ? "Ricerca..." : "Applica"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenreFilterModal;