import { Film, Tv, Clapperboard, Hourglass } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Skeleton from "../../components/ui/Skeleton";
import { useLibraryStats } from "../../hooks/useLibraryStats";
import { splitDuration } from "../../utils/stats";
import styles from "./Stats.module.css";

// Numero + etichetta (es. "3 days"), con singolare/plurale.
function Unit({ value, one, many }) {
  return (
    <span className={styles.unit}>
      <strong>{value}</strong> {value === 1 ? one : many}
    </span>
  );
}

function DurationBlock({ label, minutes }) {
  const { days, hours, minutes: mins } = splitDuration(minutes);
  return (
    <div className={styles.durationRow}>
      <span className={styles.durationLabel}>{label}</span>
      <span className={styles.durationValue}>
        <Unit value={days} one="day" many="days" />
        <Unit value={hours} one="hour" many="hours" />
        <Unit value={mins} one="minute" many="minutes" />
      </span>
    </div>
  );
}

function TotalTime({ minutes }) {
  const { days, hours, minutes: mins } = splitDuration(minutes);
  return (
    <p className={styles.heroValue}>
      <Unit value={days} one="day" many="days" />
      <Unit value={hours} one="hour" many="hours" />
      <Unit value={mins} one="minute" many="minutes" />
    </p>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className={styles.card}>
      <Icon size={20} className={styles.cardIcon} />
      <p className={styles.cardValue}>{value}</p>
      <p className={styles.cardLabel}>{label}</p>
    </div>
  );
}

function Stats() {
  const { stats, loading, error } = useLibraryStats();

  return (
    <div>
      <PageHeader title="Statistics" backTo="/profile" />
      <div className={styles.page}>
        {loading ? (
          <>
            <Skeleton className={styles.skeletonHero} />
            <div className={styles.grid}>
              <Skeleton className={styles.skeletonCard} />
              <Skeleton className={styles.skeletonCard} />
              <Skeleton className={styles.skeletonCard} />
              <Skeleton className={styles.skeletonCard} />
            </div>
          </>
        ) : error ? (
          <p className={styles.message}>Could not load your statistics. Try again later.</p>
        ) : (
          <>
            <section className={styles.hero}>
              <Hourglass size={22} className={styles.heroIcon} />
              <p className={styles.heroLabel}>Time spent watching</p>
              <TotalTime minutes={stats.totalMinutes} />
              <div className={styles.durations}>
                <DurationBlock label="Movies" minutes={stats.movieMinutes} />
                <DurationBlock label="TV shows" minutes={stats.seriesMinutes} />
              </div>
            </section>

            <div className={styles.grid}>
              <StatCard icon={Film} value={stats.moviesWatched} label="Movies watched" />
              <StatCard icon={Tv} value={stats.seriesCompleted} label="TV shows completed" />
              <StatCard icon={Clapperboard} value={stats.episodesWatched} label="Episodes watched" />
              <StatCard icon={Hourglass} value={stats.seriesInProgress} label="TV shows in progress" />
            </div>

            <p className={styles.note}>
              Times are estimates: movies use their runtime, TV shows use the
              average episode length times the episodes you marked as watched.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Stats;
