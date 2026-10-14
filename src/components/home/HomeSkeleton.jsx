import Skeleton from "../ui/Skeleton";
import SkeletonRow from "../ui/SkeletonRow";
import styles from "./HomeSkeleton.module.css";

// Scheletro della Home mentre carica: blocco in evidenza, fila di generi
// e due righe di card (stesso ordine della pagina vera).
function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className={styles.hero} />
      <Skeleton className={styles.heading} />
      <div className={styles.chips}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className={styles.chip} />
        ))}
      </div>
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}

export default HomeSkeleton;
