import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPersonDetails,
  getPersonCombinedCredits,
  getPersonImages,
  IMG_URL,
  IMG_URL_LARGE,
} from "../../services/tmdb";
import KnownForCard from "../../components/show/KnownForCard";
import CreditListItem from "../../components/show/CreditListItem";
import { ArrowLeft, X } from "lucide-react";
import styles from "./PersonDetail.module.css";

function calculateAge(birthday, deathday) {
  if (!birthday) return null;

  const end = deathday ? new Date(deathday) : new Date();
  const start = new Date(birthday);

  let age = end.getFullYear() - start.getFullYear();
  const hasHadBirthdayThisYear =
    end.getMonth() > start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() >= start.getDate());

  if (!hasHadBirthdayThisYear) age--;

  return age;
}

function getYear(item) {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : "Anno sconosciuto";
}

function dedupeAndSort(items) {
  const seen = new Set();
  const unique = [];

  items.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  });

  return unique.sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";
    return dateB.localeCompare(dateA);
  });
}

function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState(null);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("tv");
  const [selectedShot, setSelectedShot] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const knownForRowRef = useRef(null);

  useEffect(() => {
    getPersonDetails(id).then((data) => {
      setPerson(data);
    });
  }, [id]);

  useEffect(() => {
    getPersonCombinedCredits(id).then((data) => {
      setCredits(data);
    });
  }, [id]);

  useEffect(() => {
    getPersonImages(id).then((data) => {
      setImages(data);
    });
  }, [id]);

  if (!person || !credits) {
    return <p>Caricamento...</p>;
  }

  const photoSrc = person.profile_path
    ? `${IMG_URL_LARGE}${person.profile_path}`
    : "https://placehold.co/300x450?text=No+Image";

  const age = calculateAge(person.birthday, person.deathday);
  const birthdayFormatted = person.birthday
    ? new Date(person.birthday).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const knownFor = [...credits]
    .filter(
      (item, index, arr) =>
        arr.findIndex(
          (x) => x.id === item.id && x.media_type === item.media_type,
        ) === index,
    )
    .sort((a, b) => {
      const weightA = (a.episode_count || 1) * (a.popularity || 0);
      const weightB = (b.episode_count || 1) * (b.popularity || 0);
      return weightB - weightA;
    })
    .slice(0, 15);

  const movieList = dedupeAndSort(
    credits.filter((item) => item.media_type === "movie"),
  );
  const tvList = dedupeAndSort(
    credits.filter((item) => item.media_type === "tv"),
  );

  const activeList = activeTab === "movie" ? movieList : tvList;

  function scrollRow(ref, direction) {
    ref.current.scrollBy({ left: direction * 400, behavior: "smooth" });
  }

  return (
    <div className={styles.personPage}>
      <div className={styles.header}>
        <div className={styles.photoWrapper}>
          <img src={photoSrc} alt={person.name} className={styles.photo} />
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className={styles.info}>
          <h1>{person.name}</h1>

          <div className={styles.infoCard}>
            {person.birthday && (
              <div className={styles.infoRow}>
                <p className={styles.infoLabel}>Nato/a</p>
                <p className={styles.infoValue}>
                  {age !== null ? `${age} anni • ` : ""}
                  {birthdayFormatted}
                </p>
              </div>
            )}
            {person.place_of_birth && (
              <div className={styles.infoRow}>
                <p className={styles.infoLabel}>Luogo di nascita</p>
                <p className={styles.infoValue}>{person.place_of_birth}</p>
              </div>
            )}
            {person.known_for_department && (
              <div className={styles.infoRow}>
                <p className={styles.infoLabel}>Conosciuto/a per</p>
                <p className={styles.infoValue}>
                  {person.known_for_department}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.overviewSection}>
        <h2>Biografia</h2>
        <p className={bioExpanded ? styles.bioTextExpanded : styles.bioText}>
          {person.biography || "Nessuna biografia disponibile."}
        </p>
        {person.biography && person.biography.length > 300 && (
          <button
            type="button"
            className={styles.bioToggle}
            onClick={() => setBioExpanded((prev) => !prev)}
          >
            {bioExpanded ? "Mostra meno" : "Mostra tutto"}
          </button>
        )}
      </div>

      <div className={styles.rowSection}>
        <h2>Known For & Career Highlights</h2>
        {knownFor.length > 0 ? (
          <div className={styles.rowWrapper}>
            <button
              className={styles.arrowLeft}
              onClick={() => scrollRow(knownForRowRef, -1)}
            >
              ‹
            </button>

            <div className={styles.scrollRow} ref={knownForRowRef}>
              {knownFor.map((item) => (
                <KnownForCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                />
              ))}
            </div>

            <div className={styles.fade} />

            <button
              className={styles.arrowRight}
              onClick={() => scrollRow(knownForRowRef, 1)}
            >
              ›
            </button>
          </div>
        ) : (
          <p>Nessun contenuto disponibile.</p>
        )}
      </div>

      {images.length > 0 && (
        <div className={styles.rowSection}>
          <h2>Shots</h2>
          <div className={styles.scrollRow}>
            {images.map((image, index) => (
              <img
                key={index}
                src={`${IMG_URL}${image.file_path}`}
                alt={`${person.name} ${index + 1}`}
                className={styles.shot}
                onClick={() =>
                  setSelectedShot(`${IMG_URL_LARGE}${image.file_path}`)
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.rowSection}>
        <div className={styles.toggle}>
          <button
            type="button"
            className={
              activeTab === "movie"
                ? `${styles.toggleButton} ${styles.toggleButtonActive}`
                : styles.toggleButton
            }
            onClick={() => setActiveTab("movie")}
          >
            Film <span className={styles.count}>{movieList.length}</span>
          </button>
          <button
            type="button"
            className={
              activeTab === "tv"
                ? `${styles.toggleButton} ${styles.toggleButtonActive}`
                : styles.toggleButton
            }
            onClick={() => setActiveTab("tv")}
          >
            Serie TV <span className={styles.count}>{tvList.length}</span>
          </button>
        </div>

        {activeList.length > 0 ? (
          <div className={styles.timeline}>
            <div className={styles.timelineLine} />
            {activeList.map((item, index) => {
              const year = getYear(item);
              const prevYear =
                index > 0 ? getYear(activeList[index - 1]) : null;
              const showYear = year !== prevYear;

              return (
                <div
                  className={styles.timelineRow}
                  key={`${item.media_type}-${item.id}-${item.credit_id}`}
                >
                  <div className={styles.yearCol}>
                    {showYear && (
                      <span className={styles.yearBadge}>{year}</span>
                    )}
                    <span className={styles.dot} />
                  </div>
                  <CreditListItem item={item} />
                </div>
              );
            })}
          </div>
        ) : (
          <p>Nessun contenuto disponibile.</p>
        )}
      </div>

      {selectedShot && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedShot(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedShot} alt={person.name} />
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setSelectedShot(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonDetail;