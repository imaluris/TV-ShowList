import { Check } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./Language.module.css";

const LANGUAGES = [
  { value: "it", label: "Italiano", available: true },
  { value: "en", label: "English", available: false },
];

function Language() {
  return (
    <div>
      <PageHeader title="Regione e lingua" backTo="/profile" />
      <div className={styles.page}>

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
    </div>
  );
}

export default Language;