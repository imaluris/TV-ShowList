import { Link } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import BackdropSlideshow from "./BackdropSlideshow";
import styles from "./DetailHero.module.css";

const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

// Testata delle pagine di dettaglio: immagine di sfondo che sfuma nello
// sfondo della pagina, pulsante indietro in vetro, locandina sovrapposta,
// titolo, riga di dati e (children) i pulsanti d'azione.
//   backdrop/poster: percorsi TMDB (opzionali)
//   onBack: al posto di backTo, per tornare alla pagina precedente
//   person: pagina di una persona. La foto è solo un ritratto (TMDB non ha
//           immagini orizzontali per le persone), quindi la mostriamo come
//           la locandina e lo sfondo è un bagliore color accento, invece di
//           una foto ingrandita e sfocata.
//   backdrops: (solo persone) percorsi di immagini di film e serie famosi,
//              che scorrono da soli come sfondo
function DetailHero({
  backdrop,
  poster,
  title,
  subtitle,
  meta,
  backTo,
  onBack,
  person,
  backdrops = [],
  children,
}) {
  const backgroundPath = person ? null : backdrop || poster;
  const hasSlideshow = person && backdrops.length > 0;

  return (
    <header className={styles.hero}>
      <div
        className={`${styles.media} ${!backgroundPath && !hasSlideshow ? styles.mediaGlow : ""}`}
        aria-hidden="true"
      >
        {hasSlideshow && <BackdropSlideshow paths={backdrops} />}
        {backgroundPath && (
          <img
            className={backdrop ? styles.backdrop : styles.backdropBlur}
            src={`${backdrop ? BACKDROP_URL : POSTER_URL}${backgroundPath}`}
            alt=""
            fetchPriority="high"
          />
        )}
        <div className={styles.fade} />
      </div>

      {onBack ? (
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
      ) : (
        <Link to={backTo} className={styles.back} aria-label="Back">
          <ArrowLeft size={20} />
        </Link>
      )}

      <div className={styles.inner}>
        {poster && (
          <img
            className={styles.poster}
            src={`${POSTER_URL}${poster}`}
            alt={title}
          />
        )}

        {person && !poster && (
          <div className={styles.posterEmpty}>
            <User size={48} />
          </div>
        )}

        <div className={styles.text}>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <h1 className={styles.title}>{title}</h1>
          {meta && <div className={styles.meta}>{meta}</div>}
          {children && <div className={styles.actions}>{children}</div>}
        </div>
      </div>
    </header>
  );
}

export default DetailHero;
