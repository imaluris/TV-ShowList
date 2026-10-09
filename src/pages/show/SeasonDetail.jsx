import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getShowDetails,
  getSeasonDetails,
  getAggregateCreditsShow,
} from "../../services/tmdb";
import { getTitle } from "../../utils/media";
import CastCard from "../../components/show/CastCard";
import EpisodeCard from "../../components/show/EpisodeCard";
import styles from "./SeasonDetail.module.css";
import DetailSkeleton from "../../components/ui/DetailSkeleton";
import DetailHero from "../../components/ui/DetailHero";
import Section from "../../components/ui/Section";
import Chips from "../../components/ui/Chips";
import Rail from "../../components/ui/Rail";

function SeasonDetail() {
  const { showId, seasonNumber } = useParams();
  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(null);
  const [showCredits, setShowCredits] = useState(null);

  useEffect(() => {
    getShowDetails("tv", showId).then((data) => {
      setShow(data);
    });
  }, [showId]);

  useEffect(() => {
    getSeasonDetails(showId, seasonNumber).then((data) => {
      setSeason(data);
    });
  }, [showId, seasonNumber]);

  useEffect(() => {
    getAggregateCreditsShow("tv", showId).then((data) => {
      setShowCredits(data);
    });
  }, [showId]);

  if (!show || !season || !showCredits) {
    return <DetailSkeleton />;
  }

  const showTitle = getTitle(show);

  // Stagioni "vere" (senza la 0, gli speciali): servono a EpisodeCard per
  // salvare nel documento Firestore quanti episodi ha la serie in totale.
  const seasons = show.seasons.filter((s) => s.season_number !== 0);

  // Cast aggregato dello show (già con roles[0].character pronto) unito
  // agli eventuali attori specifici di questa stagione non già presenti,
  // così i protagonisti compaiono per primi e la lista è completa.
  const showCast = showCredits?.cast || [];
  const seasonGuests = season.credits?.cast || [];

  const showCastIds = new Set(showCast.map((member) => member.id));
  const extraGuests = seasonGuests
    .filter((member) => !showCastIds.has(member.id))
    .map((member) => ({
      ...member,
      roles: [{ character: member.character }],
    }));

  const cast = [...showCast, ...extraGuests];

  const airYear = season.air_date ? season.air_date.slice(0, 4) : "";

  return (
    <div className={styles.page}>
      <DetailHero
        backdrop={show.backdrop_path}
        poster={season.poster_path}
        subtitle={showTitle}
        title={season.name}
        backTo={`/show/tv/${showId}`}
        meta={<Chips items={[`${season.episodes.length} episodi`, airYear]} />}
      />

      <div className={styles.container}>
        {season.overview && <p className={styles.overview}>{season.overview}</p>}

        <Section title="Episodi">
          <div className={styles.episodesList}>
            {season.episodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                showId={showId}
                mediaType="tv"
                title={showTitle}
                posterPath={show.poster_path}
                seasons={seasons}
                seasonNumber={seasonNumber}
                episode={episode}
              />
            ))}
          </div>
        </Section>

        <Section title="Cast">
          {cast.length > 0 ? (
            <Rail>
              {cast.slice(0, 50).map((member) => (
                <CastCard key={member.id} member={member} />
              ))}
            </Rail>
          ) : (
            <p className={styles.empty}>Nessun attore disponibile.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

export default SeasonDetail;
