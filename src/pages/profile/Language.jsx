import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import styles from "./Language.module.css";

const LANGUAGES = [
  { value: "it", label: "Italiano", available: true },
  { value: "en", label: "English", available: false },
];

function Language() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/profile" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Regione e lingua</h1>
      </div>

      <div className={styles.optionsList}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            className={lang.available ? styles.option : styles.optionDisabled}
            disabled={!lang.available}
          >
            <span>
              {lang.label}
              {!lang.available && <span className={styles.badge}>Presto disponibile</span>}
            </span>
            {lang.value === "it" && <Check size={18} className={styles.check} />}
          </button>
        ))}
      </div>

      <p className={styles.note}>
        Al momento l'app è disponibile solo in italiano. Altre lingue arriveranno in futuro.
      </p>
    </div>
  );
}

export default Language;