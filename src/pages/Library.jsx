import { useState, useEffect } from "react";
import { Bookmark, Clock, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToLibrary, LIBRARY_STATUS } from "../services/firestore";
import LibraryCard from "../components/LibraryCard";
import styles from "./Library.module.css";

const TABS = [
  {
    value: LIBRARY_STATUS.TO_WATCH,
    label: "Da vedere",
    icon: Bookmark,
    emptyText: "Non hai ancora titoli da vedere. Salvane uno dalla pagina di dettaglio.",
  },
  {
    value: LIBRARY_STATUS.WATCHING,
    label: "In corso",
    icon: Clock,
    emptyText: "Nessuna serie in corso al momento.",
  },
  {
    value: LIBRARY_STATUS.WATCHED,
    label: "Viste",
    icon: Check,
    emptyText: "Non hai ancora segnato nulla come visto.",
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
    <div className={styles.libraryPage}>
      <h1 className={styles.title}>Libreria</h1>

      <div className={styles.tabRow}>
        <div className={styles.tabGroup}>
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={activeTab === value ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={styles.message}>Caricamento...</p>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <EmptyIcon size={28} />
          </div>
          <p className={styles.emptyTitle}>Sezione vuota</p>
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
  );
}

export default Library;