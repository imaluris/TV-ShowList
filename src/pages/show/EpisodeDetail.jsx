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
import { getContentLanguage } from "../../services/language";

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
    ? new Date(episode.air_date).toLocaleDateString(getContentLanguage(), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const guestStars = episode.credits?.guest_stars || [];

  // Riga 1: solo gli attori fissi che compaiono in QUESTO episodio
  // (episode.credits.cast). Se TMDB non li ha, ripieghiamo sul cast
  // aggregato dell'intera serie (già con roles[0].character pronto).
  const episodeCast = (episode.credits?.cast || []).map((member) => ({
    ...member,
    roles: [{ character: member.character }],
  }));
  const fullCast =
    episodeCast.length > 0 ? episodeCast : showCredits?.cast || [];

  // Riga 2: solo gli ospiti specifici di questo episodio.
  const guestCast = guestStars.map((member) => ({
    ...member,
    roles: [{ character: member.character }],
  }));

  return (
    <div className={styles.page}>
      <DetailHero
        backdrop={episode.still_path}
        subtitle={`Season ${seasonNumber} · Episode ${episode.episode_number}`}
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
          {episode.overview || "No description available."}
        </p>

        <Section title="Cast">
          {fullCast.length > 0 ? (
            <Rail>
              {fullCast.slice(0, 50).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </Rail>
          ) : (
            <p className={styles.empty}>No cast available.</p>
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
            <p className={styles.empty}>No guest stars for this episode.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

export default EpisodeDetail;
