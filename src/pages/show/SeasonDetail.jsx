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

  // Cast della sola stagione (season.credits), così non compaiono attori
  // presenti solo in altre stagioni. Solo se TMDB non ha il cast della
  // stagione ripieghiamo su quello aggregato dell'intera serie.
  const seasonCast = (season.credits?.cast || []).map((member) => ({
    ...member,
    roles: [{ character: member.character }],
  }));

  const cast = seasonCast.length > 0 ? seasonCast : showCredits?.cast || [];

  const airYear = season.air_date ? season.air_date.slice(0, 4) : "";

  return (
    <div className={styles.page}>
      <DetailHero
        backdrop={show.backdrop_path}
        poster={season.poster_path}
        subtitle={showTitle}
        title={season.name}
        backTo={`/show/tv/${showId}`}
        meta={<Chips items={[`${season.episodes.length} ${season.episodes.length === 1 ? "episode" : "episodes"}`, airYear]} />}
      />

      <div className={styles.container}>
        {season.overview && <p className={styles.overview}>{season.overview}</p>}

        <Section title="Episodes">
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
            <p className={styles.empty}>No cast available.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

export default SeasonDetail;
