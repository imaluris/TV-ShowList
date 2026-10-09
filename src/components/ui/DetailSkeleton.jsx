import Skeleton from "./Skeleton";
import SkeletonRow from "./SkeletonRow";
import styles from "./DetailSkeleton.module.css";

// Scheletro delle pagine di dettaglio: ricalca la testata (immagine,
// locandina, titolo, etichette) e poi testo e una riga di card.
function DetailSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Caricamento">
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <Skeleton className={styles.poster} />
          <div className={styles.heroText}>
            <Skeleton className={styles.title} />
            <div className={styles.chips}>
              <Skeleton className={styles.chip} />
              <Skeleton className={styles.chip} />
              <Skeleton className={styles.chip} />
            </div>
            <Skeleton className={styles.button} />
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <Skeleton className={styles.line} />
        <Skeleton className={styles.line} />
        <Skeleton className={styles.lineShort} />
        <SkeletonRow cards={5} />
      </div>
    </div>
  );
}

export default DetailSkeleton;
