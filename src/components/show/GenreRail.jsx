import { Link } from "react-router-dom";
import Rail from "../ui/Rail";
import { getGenreIcon, getGenreHue } from "../../constants/genreIcons";
import styles from "./GenreRail.module.css";

// Riga scorrevole di tessere colorate, una per genere. Ogni tessera porta
// alla pagina del genere; `linkSuffix` aggiunge parametri al link
// (es. "?provider=8" per restare dentro una piattaforma).
function GenreRail({ genres, linkSuffix = "" }) {
  return (
    <Rail className={styles.row}>
      {genres.map((genre) => {
        const Icon = getGenreIcon(genre.id);
        const hue = getGenreHue(genre.id);

        return (
          <Link
            key={genre.id}
            to={`/genre/${genre.id}${linkSuffix}`}
            className={styles.tile}
            style={{ "--hue": hue }}
          >
            <Icon className={styles.icon} size={44} strokeWidth={1.6} aria-hidden="true" />
            <span className={styles.name}>{genre.name}</span>
          </Link>
        );
      })}
    </Rail>
  );
}

export default GenreRail;
