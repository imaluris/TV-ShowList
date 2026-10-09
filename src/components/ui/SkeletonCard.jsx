import Skeleton from "./Skeleton";
import styles from "./SkeletonCard.module.css";

// Stessa forma di ShowCard: locandina 2:3 + due righe di testo.
function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton className={styles.poster} />
      <div className={styles.info}>
        <Skeleton className={styles.line} />
        <Skeleton className={styles.lineShort} />
      </div>
    </div>
  );
}

export default SkeletonCard;
