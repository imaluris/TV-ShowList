import { useState, useEffect, useRef } from "react";
import { Bookmark, Check, Clock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  LIBRARY_STATUS,
  subscribeToLibraryItem,
  setLibraryStatus,
  removeFromLibrary,
} from "../../services/firestore";
import styles from "./LibraryStatusButtons.module.css";

const OPTIONS = [
  { value: LIBRARY_STATUS.TO_WATCH, label: "Da vedere", icon: Bookmark },
  { value: LIBRARY_STATUS.WATCHED, label: "Vista", icon: Check },
];

// Voci speciali: non sono stati.
// "Azzera" riporta la serie a "Da vedere" cancellando le spunte,
// "Rimuovi" la toglie del tutto dalla libreria.
const RESET_VALUE = "reset";
const REMOVE_VALUE = "remove";
const RESET_OPTION = { value: RESET_VALUE, label: "Azzera", icon: RotateCcw };
const REMOVE_OPTION = {
  value: REMOVE_VALUE,
  label: "Rimuovi",
  icon: Trash2,
};

// Icona del pulsante in base allo stato attuale (Plus se non c'è stato).
const STATUS_ICONS = {
  [LIBRARY_STATUS.TO_WATCH]: Bookmark,
  [LIBRARY_STATUS.WATCHING]: Clock,
  [LIBRARY_STATUS.WATCHED]: Check,
};

// Una serie TV è "iniziata" se è in corso o vista: ha del progresso da perdere.
function isStartedSeries(status, mediaType) {
  return (
    mediaType === "tv" &&
    (status === LIBRARY_STATUS.WATCHING || status === LIBRARY_STATUS.WATCHED)
  );
}

// Quali voci mostrare nel menu in base allo stato attuale.
function getVisibleOptions(status, mediaType) {
  // Non è in libreria: si può solo aggiungerla.
  if (!status) return OPTIONS;

  const started = isStartedSeries(status, mediaType);

  // Stati scegliibili: mai quello attuale, e mai "Da vedere"
  // per una serie già iniziata (per quello c'è "Azzera").
  const stateOptions = OPTIONS.filter(
    (option) =>
      option.value !== status &&
      !(started && option.value === LIBRARY_STATUS.TO_WATCH),
  );

  return [...stateOptions, ...(started ? [RESET_OPTION] : []), REMOVE_OPTION];
}

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
        `Azzerare tutti gli episodi visti di "${title}"?`,
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
          `Rimuovere "${title}" dalla libreria? Perderai anche gli episodi visti.`,
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

  if (loading) return null;

  const visibleOptions = getVisibleOptions(status, mediaType);
  const TriggerIcon = STATUS_ICONS[status] || Plus;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={status ? styles.triggerActive : styles.trigger}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Aggiungi alla libreria"
      >
        <TriggerIcon size={20} />
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