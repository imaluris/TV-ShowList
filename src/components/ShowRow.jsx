import { useRef } from "react";
import ShowCard from "./ShowCard";
import styles from "./ShowRow.module.css";

function ShowRow({ title, shows }) {
  const rowRef = useRef(null);

  if (!shows || shows.length === 0) {
    return null;
  }

  function scrollLeft() {
    rowRef.current.scrollBy({ left: -400, behavior: "smooth" });
  }

  function scrollRight() {
    rowRef.current.scrollBy({ left: 400, behavior: "smooth" });
  }

  return (
    <section>
      <h2>{title}</h2>
      <div className={styles.rowWrapper}>
        <button className={styles.arrowLeft} onClick={scrollLeft}>
          ‹
        </button>

        <div className={styles.row} ref={rowRef}>
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>

        <div className={styles.fade} />

        <button className={styles.arrowRight} onClick={scrollRight}>
          ›
        </button>
      </div>
    </section>
  );
}

export default ShowRow;