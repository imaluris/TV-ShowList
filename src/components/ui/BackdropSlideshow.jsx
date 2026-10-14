import { useEffect, useState } from "react";
import styles from "./BackdropSlideshow.module.css";

const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";
const ROTATE_MS = 6500;

// Immagini di sfondo che si alternano da sole con una dissolvenza, nello
// stesso formato dello sfondo di film e serie. Riempie il contenitore
// (che deve avere position: relative/absolute).
function BackdropSlideshow({ paths }) {
  const [active, setActive] = useState(0);
  // La lista arriva come nuovo array a ogni render: la confrontiamo come testo.
  const key = paths.join("|");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || paths.length < 2) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % paths.length);
    }, ROTATE_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className={styles.slideshow}>
      {paths.map((path, index) => (
        <img
          key={path}
          className={index === active ? styles.slideActive : styles.slide}
          src={`${BACKDROP_URL}${path}`}
          alt=""
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      ))}
    </div>
  );
}

export default BackdropSlideshow;
