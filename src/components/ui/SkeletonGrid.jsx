import SkeletonCard from "./SkeletonCard";
import styles from "./SkeletonGrid.module.css";

// Segnaposto per le pagine a griglia (genere, libreria).
function SkeletonGrid({ cards = 12 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: cards }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonGrid;
