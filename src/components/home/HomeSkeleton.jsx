import Skeleton from "../ui/Skeleton";
import SkeletonRow from "../ui/SkeletonRow";
import styles from "./HomeSkeleton.module.css";

// Scheletro della Home mentre carica: blocco in evidenza, due righe di card
// e la fila di generi.
function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Caricamento">
      <Skeleton className={styles.hero} />
      <SkeletonRow />
      <SkeletonRow />
      <Skeleton className={styles.heading} />
      <div className={styles.chips}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className={styles.chip} />
        ))}
      </div>
    </div>
  );
}

export default HomeSkeleton;
