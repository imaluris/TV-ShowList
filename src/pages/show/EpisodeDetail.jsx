import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getEpisodeDetails,
  getAggregateCreditsShow,
} from "../../services/tmdb";
import CastCard from "../../components/show/CastCard";
import { Star } from "lucide-react";
import styles from "./EpisodeDetail.module.css";
import DetailSkeleton from "../../components/ui/DetailSkeleton";
import DetailHero from "../../components/ui/DetailHero";
import Section from "../../components/ui/Section";
import Chips from "../../components/ui/Chips";
import Rail from "../../components/ui/Rail";

function EpisodeDetail() {
  const { showId, seasonNumber, episodeNumber } = useParams();
  const [episode, setEpisode] = useState(null);
  const [showCredits, setShowCredits] = useState(null);

  useEffect(() => {
    getEpisodeDetails(showId, seasonNumber, episodeNumber).then((data) => {
      setEpisode(data);
    });
  }, [showId, seasonNumber, episodeNumber]);

  useEffect(() => {
    getAggregateCreditsShow("tv", showId).then((data) => {
      setShowCredits(data);
    });
  }, [showId]);

  if (!episode || !showCredits) {
    return <DetailSkeleton />;
  }

  const dateFormatted = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const guestStars = episode.credits?.guest_stars || [];
  // Il cast aggregato dello show ha già member.roles[0].character pronto,
  // non serve trasformarlo (a differenza dei guest stars).
  const showCast = showCredits?.cast || [];

  // Riga 1: cast principale dello show + eventuali guest non già presenti
  // tra gli attori fissi, così i protagonisti compaiono per primi.
  const showCastIds = new Set(showCast.map((member) => member.id));
  const extraGuests = guestStars
    .filter((member) => !showCastIds.has(member.id))
    .map((member) => ({
      ...member,
      roles: [{ character: member.character }],
    }));

  const fullCast = [...showCast, ...extraGuests];

  // Riga 2: solo gli ospiti specifici di questo episodio.
  const guestCast = guestStars.map((member) => ({
    ...member,
    roles: [{ character: member.character }],
  }));

  return (
    <div className={styles.page}>
      <DetailHero
        backdrop={episode.still_path}
        subtitle={`Stagione ${seasonNumber} · Episodio ${episode.episode_number}`}
        title={episode.name}
        backTo={`/show/${showId}/season/${seasonNumber}`}
        meta={
          <Chips
            items={[
              episode.vote_average > 0 && {
                label: episode.vote_average.toFixed(1),
                accent: true,
                icon: <Star size={13} fill="currentColor" />,
              },
              dateFormatted,
              episode.runtime ? `${episode.runtime} min` : "",
            ]}
          />
        }
      />

      <div className={styles.container}>
        <p className={styles.overview}>
          {episode.overview || "Nessuna descrizione disponibile."}
        </p>

        <Section title="Cast">
          {fullCast.length > 0 ? (
            <Rail>
              {fullCast.slice(0, 50).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </Rail>
          ) : (
            <p className={styles.empty}>Nessun attore disponibile.</p>
          )}
        </Section>

        <Section title="Guest star">
          {guestCast.length > 0 ? (
            <Rail>
              {guestCast.map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </Rail>
          ) : (
            <p className={styles.empty}>Nessun ospite per questo episodio.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

export default EpisodeDetail;
