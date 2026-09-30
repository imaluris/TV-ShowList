import { useState, useEffect, useRef } from "react";
import { Bookmark, Check, Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  LIBRARY_STATUS,
  getLibraryItem,
  setLibraryStatus,
  removeFromLibrary,
} from "../services/firestore";
import styles from "./LibraryStatusButtons.module.css";

const OPTIONS = [
  { value: LIBRARY_STATUS.TO_WATCH, label: "Da vedere", icon: Bookmark },
  { value: LIBRARY_STATUS.WATCHED, label: "Vista", icon: Check },
];

function LibraryStatusButtons({ mediaType, tmdbId, title, posterPath }) {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    getLibraryItem(currentUser.uid, mediaType, tmdbId).then((item) => {
      setStatus(item ? item.status : null);
      setLoading(false);
    });
  }, [currentUser, mediaType, tmdbId]);

  // Chiude la tendina se clicchi fuori.
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

    // Riselezionare lo stato già attivo rimuove il titolo dalla libreria.
    if (status === value) {
      setStatus(null);
      await removeFromLibrary(currentUser.uid, mediaType, tmdbId);
      return;
    }

    setStatus(value); // aggiornamento ottimista
    await setLibraryStatus(currentUser.uid, {
      mediaType,
      tmdbId,
      status: value,
      title,
      posterPath,
    });
  }

  if (loading) return null;

  const activeOption = OPTIONS.find((option) => option.value === status);
  const TriggerIcon = activeOption ? activeOption.icon : Plus;

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
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={status === value ? styles.optionActive : styles.option}
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