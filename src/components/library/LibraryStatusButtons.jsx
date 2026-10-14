import { useState, useEffect, useRef } from "react";
import { Bookmark, Check, ChevronDown, Clock, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  LIBRARY_STATUS,
  subscribeToLibraryItem,
  setLibraryStatus,
  removeFromLibrary,
} from "../../services/firestore";
import {
  RESET_VALUE,
  REMOVE_VALUE,
  isStartedSeries,
  getVisibleOptions,
} from "./libraryMenu";
import Skeleton from "../ui/Skeleton";
import styles from "./LibraryStatusButtons.module.css";

// Icona del pulsante in base allo stato attuale (Plus se non c'è stato).
const STATUS_LABELS = {
  [LIBRARY_STATUS.TO_WATCH]: "To watch",
  [LIBRARY_STATUS.WATCHING]: "Watching",
  [LIBRARY_STATUS.WATCHED]: "Watched",
};

const STATUS_ICONS = {
  [LIBRARY_STATUS.TO_WATCH]: Bookmark,
  [LIBRARY_STATUS.WATCHING]: Clock,
  [LIBRARY_STATUS.WATCHED]: Check,
};

function LibraryStatusButtons({ mediaType, tmdbId, title, posterPath, seasons }) {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribe = subscribeToLibraryItem(
      currentUser.uid,
      mediaType,
      tmdbId,
      (item) => {
        setStatus(item ? item.status : null);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [currentUser, mediaType, tmdbId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(value) {
    setIsOpen(false);
    if (!currentUser) return;

    if (value === RESET_VALUE) {
      const confirmed = window.confirm(
        `Reset all watched episodes of "${title}"?`,
      );
      if (!confirmed) return;

      await setLibraryStatus(currentUser.uid, {
        mediaType,
        tmdbId,
        status: LIBRARY_STATUS.TO_WATCH,
        title,
        posterPath,
        seasons,
      });
      return;
    }

    if (value === REMOVE_VALUE) {
      // Rimuovere una serie già iniziata cancella anche le spunte: chiediamo conferma.
      if (isStartedSeries(status, mediaType)) {
        const confirmed = window.confirm(
          `Remove "${title}" from your library? You will also lose your watched episodes.`,
        );
        if (!confirmed) return;
      }

      await removeFromLibrary(currentUser.uid, mediaType, tmdbId);
      return;
    }

    await setLibraryStatus(currentUser.uid, {
      mediaType,
      tmdbId,
      status: value,
      title,
      posterPath,
      seasons,
    });
  }

  if (loading) return <Skeleton className={styles.placeholder} />;

  const visibleOptions = getVisibleOptions(status, mediaType);
  const TriggerIcon = STATUS_ICONS[status] || Plus;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={status ? styles.triggerActive : styles.trigger}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Add to library"
      >
        <TriggerIcon size={18} />
        <span>{STATUS_LABELS[status] || "Add"}</span>
        <ChevronDown size={16} className={isOpen ? styles.chevronOpen : styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {visibleOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={styles.option}
              onClick={() => handleSelect(value)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryStatusButtons;