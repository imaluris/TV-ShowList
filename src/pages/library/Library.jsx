import { useState, useEffect } from "react";
import { Bookmark, Clock, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToLibrary, LIBRARY_STATUS } from "../../services/firestore";
import SegmentedControl from "../../components/ui/SegmentedControl";
import SkeletonGrid from "../../components/ui/SkeletonGrid";
import LibraryCard from "../../components/library/LibraryCard";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./Library.module.css";

const TABS = [
  {
    value: LIBRARY_STATUS.TO_WATCH,
    label: "To watch",
    icon: Bookmark,
    emptyText: "You have nothing to watch yet. Save a title from its detail page.",
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
    emptyText: "You haven't marked anything as watched yet.",
  },
];

function Library() {
  const { currentUser } = useAuth();
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

  const currentTab = TABS.find((tab) => tab.value === activeTab);
  const filteredItems = items.filter((item) => item.status === activeTab);
  const EmptyIcon = currentTab.icon;

  return (
    <div>
      <PageHeader title="Library" />
      <div className={styles.libraryPage}>

      <div className={styles.tabRow}>
        <SegmentedControl
          label="Status"
          options={TABS}
          value={activeTab}
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
          <p className={styles.emptyText}>{currentTab.emptyText}</p>
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