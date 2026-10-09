import { Link } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import styles from "./DetailHero.module.css";

const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

// Testata delle pagine di dettaglio: immagine di sfondo che sfuma nello
// sfondo della pagina, pulsante indietro in vetro, locandina sovrapposta,
// titolo, riga di dati e (children) i pulsanti d'azione.
//   backdrop/poster: percorsi TMDB (opzionali)
//   onBack: al posto di backTo, per tornare alla pagina precedente
//   round: la foto è un volto (pagina persona), quindi tonda
function DetailHero({ backdrop, poster, title, subtitle, meta, backTo, onBack, round, children }) {
  const backgroundPath = backdrop || poster;

  return (
    <header className={styles.hero}>
      <div className={styles.media} aria-hidden="true">
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
        <button type="button" className={styles.back} onClick={onBack} aria-label="Indietro">
          <ArrowLeft size={20} />
        </button>
      ) : (
        <Link to={backTo} className={styles.back} aria-label="Indietro">
          <ArrowLeft size={20} />
        </Link>
      )}

      <div className={styles.inner}>
        {poster && (
          <img
            className={round ? styles.avatar : styles.poster}
            src={`${POSTER_URL}${poster}`}
            alt={title}
          />
        )}

        {round && !poster && (
          <div className={styles.avatarEmpty}>
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
