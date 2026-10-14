import { useState, useEffect } from "react";
import { Bookmark, Clock, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { subscribeToLibrary, LIBRARY_STATUS } from "../../services/firestore";
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

function Library() {
  const { currentUser } = useAuth();
  const { mediaType, isMovie } = useMediaType();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(LIBRARY_STATUS.TO_WATCH);

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

  const tabs = isMovie
    ? TABS.filter((tab) => tab.value !== LIBRARY_STATUS.WATCHING)
    : TABS;

  // Passando ai film mentre "In corso" è selezionata, si ripiega su "Da vedere".
  const currentTab = tabs.find((tab) => tab.value === activeTab) || tabs[0];

  const filteredItems = items.filter(
    (item) => item.mediaType === mediaType && item.status === currentTab.value,
  );
  const EmptyIcon = currentTab.icon;

  return (
    <div>
      {/* Lo switch Serie TV/Film sta solo nella Home e vale per tutta l'app:
          qui si indica solo cosa si sta guardando. */}
      <PageHeader title={isMovie ? "Movies library" : "TV Shows library"} />
      <div className={styles.libraryPage}>

      <div className={styles.tabRow}>
        <SegmentedControl
          label="Status"
          options={tabs}
          value={currentTab.value}
          onChange={setActiveTab}
        />
      </div>

      {loading ? (
        <SkeletonGrid cards={6} />
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