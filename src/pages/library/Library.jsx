import { useState, useEffect } from "react";
import { Bookmark, Clock, Check, Search, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { subscribeToLibrary, LIBRARY_STATUS } from "../../services/firestore";
import {
  SORT_OPTIONS,
  DEFAULT_SORT,
  sortLibraryItems,
} from "../../utils/librarySort";
import { useNewEpisodes } from "../../hooks/useNewEpisodes";
import SortMenu from "../../components/library/SortMenu";
import SegmentedControl from "../../components/ui/SegmentedControl";
import SkeletonGrid from "../../components/ui/SkeletonGrid";
import LibraryCard from "../../components/library/LibraryCard";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./Library.module.css";

// Le tre schede di stato. "In corso" esiste solo per le serie TV: per i
// film lo stato "Watching" non c'è (si guarda in una volta sola).
const TABS = [
  {
    value: LIBRARY_STATUS.TO_WATCH,
    label: "To watch",
    icon: Bookmark,
    emptyText: "You have no TV shows to watch yet. Save one from its detail page.",
    emptyTextMovie: "You have no movies to watch yet. Save one from its detail page.",
  },
  {
    value: LIBRARY_STATUS.WATCHING,
    label: "Watching",
    icon: Clock,
    emptyText: "No shows in progress right now.",
  },
  {
    value: LIBRARY_STATUS.WATCHED,
    label: "Watched",
    icon: Check,
    emptyText: "You haven't marked any TV shows as watched yet.",
    emptyTextMovie: "You haven't marked any movies as watched yet.",
  },
];

const SORT_STORAGE_KEY = "library-sort";

// Legge l'ordinamento salvato; se manca o non è valido torna al default.
function loadSavedSort() {
  try {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    if (SORT_OPTIONS.some((option) => option.value === saved)) return saved;
  } catch {
    // localStorage non disponibile: si usa il default
  }
  return DEFAULT_SORT;
}

// Minuscole e senza accenti, così "amelie" trova "Amélie".
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function Library() {
  const { currentUser } = useAuth();
  const { mediaType, isMovie } = useMediaType();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(LIBRARY_STATUS.TO_WATCH);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState(loadSavedSort);
  const newEpisodes = useNewEpisodes(items);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToLibrary(currentUser.uid, (data) => {
      setItems(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  function handleRemoved(docId) {
    setItems((prev) => prev.filter((item) => item.id !== docId));
  }

  function handleSortChange(value) {
    setSortBy(value);
    try {
      localStorage.setItem(SORT_STORAGE_KEY, value);
    } catch {
      // se non si può salvare, l'ordine vale solo per questa visita
    }
  }

  const tabs = isMovie
    ? TABS.filter((tab) => tab.value !== LIBRARY_STATUS.WATCHING)
    : TABS;

  // Passando ai film mentre "In corso" è selezionata, si ripiega su "Da vedere".
  const currentTab = tabs.find((tab) => tab.value === activeTab) || tabs[0];

  // Con una ricerca attiva si cerca in tutta la libreria del tipo scelto
  // (film o serie), qualunque sia la scheda di stato: serve a ritrovare un
  // titolo senza ricordare dove l'hai messo.
  const searchTerm = normalize(searchText.trim());
  const isSearching = searchTerm.length > 0;

  const filteredItems = sortLibraryItems(
    items.filter((item) => {
      if (item.mediaType !== mediaType) return false;
      if (isSearching) return normalize(item.title).includes(searchTerm);
      return item.status === currentTab.value;
    }),
    sortBy,
  );
  const EmptyIcon = currentTab.icon;

  return (
    <div>
      {/* Lo switch Serie TV/Film sta solo nella Home e vale per tutta l'app:
          qui si indica solo cosa si sta guardando. */}
      <PageHeader title={isMovie ? "Movies library" : "TV Shows library"} />
      <div className={styles.libraryPage}>

      <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          className={styles.searchInput}
          placeholder={isMovie ? "Search your movies" : "Search your TV shows"}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          aria-label="Search your library"
        />
        {searchText && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setSearchText("")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <SortMenu
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={handleSortChange}
      />
      </div>

      {!isSearching && (
        <div className={styles.tabRow}>
          <SegmentedControl
            label="Status"
            options={tabs}
            value={currentTab.value}
            onChange={setActiveTab}
          />
        </div>
      )}

      {loading ? (
        <SkeletonGrid cards={6} />
      ) : filteredItems.length === 0 && isSearching ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Search size={28} />
          </div>
          <p className={styles.emptyTitle}>No results</p>
          <p className={styles.emptyText}>
            Nothing in your library matches "{searchText.trim()}".
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <EmptyIcon size={28} />
          </div>
          <p className={styles.emptyTitle}>Nothing here yet</p>
          <p className={styles.emptyText}>
            {isMovie ? currentTab.emptyTextMovie || currentTab.emptyText : currentTab.emptyText}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <LibraryCard
              key={item.id}
              uid={currentUser.uid}
              item={item}
              news={newEpisodes[item.id]}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default Library;