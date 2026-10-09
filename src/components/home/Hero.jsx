import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { getTitle, getYear } from "../../utils/media";
import styles from "./Hero.module.css";

const BACKDROP_URL = "https://image.tmdb.org/t/p/w780";
const SLIDES = 5;
const ROTATE_MS = 7000;

// Blocco in evidenza in cima alla Home: i primi titoli popolari con la
// loro immagine di sfondo, che si alternano con una dissolvenza.
function Hero({ shows, mediaType }) {
  const slides = shows.filter((show) => show.backdrop_path).slice(0, SLIDES);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion || slides.length < 2) return;

    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, ROTATE_MS);

    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className={styles.hero}
      aria-label="In evidenza"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      {slides.map((show, index) => (
        <article
          key={show.id}
          className={index === active ? styles.slideActive : styles.slide}
          aria-hidden={index !== active}
        >
          <img
            className={styles.backdrop}
            src={`${BACKDROP_URL}${show.backdrop_path}`}
            alt=""
            fetchPriority={index === 0 ? "high" : "auto"}
          />
          <div className={styles.shade} />

          <div className={styles.content}>
            {show.vote_average > 0 && (
              <span className={styles.rating}>
                <Star size={13} fill="currentColor" /> {show.vote_average.toFixed(1)}
              </span>
            )}
            <h2 className={styles.title}>{getTitle(show)}</h2>
            <p className={styles.meta}>{getYear(show)}</p>
            {show.overview && <p className={styles.overview}>{show.overview}</p>}
            <Link
              to={`/show/${mediaType}/${show.id}`}
              className={styles.button}
              tabIndex={index === active ? 0 : -1}
            >
              Scopri di più
            </Link>
          </div>
        </article>
      ))}

      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((show, index) => (
            <button
              key={show.id}
              type="button"
              className={index === active ? styles.dotActive : styles.dot}
              onClick={() => setActive(index)}
              aria-label={`Mostra ${getTitle(show)}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Hero;
