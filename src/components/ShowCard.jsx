import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Check } from "lucide-react";
import { IMG_URL } from "../services/tmdb";
import { useMediaType } from "../contexts/MediaTypeContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LIBRARY_STATUS,
  subscribeToLibraryItem,
  setLibraryStatus,
  removeFromLibrary,
} from "../services/firestore";
import { getTitle, getYear } from "../utils/media";
import styles from "./ShowCard.module.css";

const OPTIONS = [
  { value: LIBRARY_STATUS.TO_WATCH, label: "Da vedere", icon: Bookmark },
  { value: LIBRARY_STATUS.WATCHED, label: "Vista", icon: Check },
];

function ShowCard({ show }) {
  const { mediaType } = useMediaType();
  const { currentUser } = useAuth();
  const title = getTitle(show);
  const year = getYear(show);

  const [status, setStatus] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const posterSrc = show.poster_path
    ? `${IMG_URL}${show.poster_path}`
    : "https://placehold.co/200x300?text=No+Image";

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToLibraryItem(
      currentUser.uid,
      mediaType,
      show.id,
      (item) => {
        setStatus(item ? item.status : null);
      },
    );

    return unsubscribe;
  }, [currentUser, mediaType, show.id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggleMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((open) => !open);
  }

  async function handleSelect(e, value) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (!currentUser) return;

    if (status === value) {
      await removeFromLibrary(currentUser.uid, mediaType, show.id);
      return;
    }

    await setLibraryStatus(currentUser.uid, {
      mediaType,
      tmdbId: show.id,
      status: value,
      title,
      posterPath: show.poster_path,
    });
  }

  return (
    <Link to={`/show/${mediaType}/${show.id}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        <img src={posterSrc} alt={title} />

        {show.vote_average > 0 && (
          <span className={styles.rating}>★ {show.vote_average.toFixed(1)}</span>
        )}

        <div className={styles.menuWrapper} ref={wrapperRef}>
          <button
            type="button"
            className={status ? styles.menuButtonActive : styles.menuButton}
            onClick={handleToggleMenu}
          >
            ⋮
          </button>

          {isOpen && (
            <div className={styles.dropdown}>
              {OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={status === value ? styles.optionActive : styles.option}
                  onClick={(e) => handleSelect(e, value)}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <p className={styles.year}>{year}</p>
      </div>
    </Link>
  );
}

export default ShowCard;