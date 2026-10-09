import Skeleton from "./Skeleton";
import SkeletonCard from "./SkeletonCard";
import styles from "./SkeletonRow.module.css";

// Segnaposto di una riga orizzontale (titolo + card).
function SkeletonRow({ cards = 6 }) {
  return (
    <section className={styles.section}>
      <Skeleton className={styles.title} />
      <div className={styles.row}>
        {Array.from({ length: cards }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  );
}

export default SkeletonRow;
