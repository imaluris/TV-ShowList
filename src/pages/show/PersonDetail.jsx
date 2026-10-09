import { useState, useEffect } from "react";
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
import { X } from "lucide-react";
import styles from "./PersonDetail.module.css";
import DetailSkeleton from "../../components/ui/DetailSkeleton";
import DetailHero from "../../components/ui/DetailHero";
import Section from "../../components/ui/Section";
import FactGrid from "../../components/ui/FactGrid";
import Rail from "../../components/ui/Rail";
import SegmentedControl from "../../components/ui/SegmentedControl";

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
    return <DetailSkeleton />;
  }

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

  const tabs = [
    { value: "tv", label: `Serie TV (${tvList.length})` },
    { value: "movie", label: `Film (${movieList.length})` },
  ];

  const facts = [
    {
      label: "Nato/a",
      value: person.birthday
        ? `${birthdayFormatted}${age !== null ? ` · ${age} anni` : ""}`
        : "",
    },
    { label: "Luogo di nascita", value: person.place_of_birth },
    { label: "Ruolo", value: person.known_for_department },
  ];

  return (
    <div className={styles.page}>
      <DetailHero
        poster={person.profile_path}
        round
        title={person.name}
        subtitle={person.known_for_department}
        onBack={() => navigate(-1)}
      />

      <div className={styles.container}>
        <FactGrid facts={facts} />

        <Section title="Biografia">
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
        </Section>

        {knownFor.length > 0 && (
          <Section title="Più conosciuto/a per">
            <Rail>
              {knownFor.map((item) => (
                <KnownForCard key={`${item.media_type}-${item.id}`} item={item} />
              ))}
            </Rail>
          </Section>
        )}

        {images.length > 0 && (
          <Section title="Foto">
            <Rail>
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={styles.shotButton}
                  onClick={() => setSelectedShot(`${IMG_URL_LARGE}${image.file_path}`)}
                  aria-label={`Ingrandisci foto ${index + 1}`}
                >
                  <img
                    src={`${IMG_URL}${image.file_path}`}
                    alt={`${person.name} ${index + 1}`}
                    className={styles.shot}
                    loading="lazy"
                  />
                </button>
              ))}
            </Rail>
          </Section>
        )}

        <Section title="Filmografia">
          <div className={styles.tabRow}>
            <SegmentedControl
              label="Tipo di titolo"
              options={tabs}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {activeList.length > 0 ? (
            <div className={styles.credits}>
              {activeList.map((item, index) => {
                const year = getYear(item);
                const prevYear = index > 0 ? getYear(activeList[index - 1]) : null;

                return (
                  <div key={`${item.media_type}-${item.id}-${item.credit_id}`}>
                    {year !== prevYear && <h3 className={styles.year}>{year}</h3>}
                    <CreditListItem item={item} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.empty}>Nessun contenuto disponibile.</p>
          )}
        </Section>
      </div>

      {selectedShot && (
        <div className={styles.modalOverlay} onClick={() => setSelectedShot(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedShot} alt={person.name} />
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setSelectedShot(null)}
              aria-label="Chiudi"
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
