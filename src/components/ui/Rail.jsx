import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Rail.module.css";

// Riga orizzontale scorrevole: sul telefono si scorre col dito, con il
// mouse compaiono le frecce ai lati. Contiene qualsiasi lista di card.
function Rail({ children, className = "" }) {
  const rowRef = useRef(null);

  function scrollBy(amount) {
    rowRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.arrowLeft}
        onClick={() => scrollBy(-400)}
        aria-label="Scorri indietro"
      >
        <ChevronLeft size={20} />
      </button>

      <div className={`${styles.row} ${className}`} ref={rowRef}>
        {children}
      </div>

      <button
        type="button"
        className={styles.arrowRight}
        onClick={() => scrollBy(400)}
        aria-label="Scorri avanti"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default Rail;
