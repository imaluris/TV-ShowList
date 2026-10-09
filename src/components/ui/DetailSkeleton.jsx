import Skeleton from "./Skeleton";
import SkeletonRow from "./SkeletonRow";
import styles from "./DetailSkeleton.module.css";

// Scheletro delle pagine di dettaglio (serie, film, stagione, episodio,
// persona): immagine grande, titolo, qualche riga di testo e una riga di card.
function DetailSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Caricamento">
      <div className={styles.header}>
        <Skeleton className={styles.poster} />
        <div className={styles.text}>
          <Skeleton className={styles.title} />
          <Skeleton className={styles.meta} />
          <Skeleton className={styles.line} />
          <Skeleton className={styles.line} />
          <Skeleton className={styles.lineShort} />
        </div>
      </div>
      <SkeletonRow cards={5} />
    </div>
  );
}

export default DetailSkeleton;
