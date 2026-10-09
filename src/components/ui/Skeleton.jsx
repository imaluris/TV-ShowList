import styles from "./Skeleton.module.css";

// Blocco grigio con un riflesso che scorre: segnaposto mentre i dati
// arrivano. La forma si decide da fuori con className o style.
function Skeleton({ className = "", style }) {
  return <div className={`${styles.skeleton} ${className}`} style={style} aria-hidden="true" />;
}

export default Skeleton;
