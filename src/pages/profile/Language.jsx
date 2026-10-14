import { useState } from "react";
import { Check } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { useLanguage } from "../../contexts/LanguageContext";
import { LANGUAGES } from "../../services/language";
import styles from "./Language.module.css";

function Language() {
  const { language, changeLanguage } = useLanguage();
  const [error, setError] = useState("");

  async function handleSelect(value) {
    if (value === language) return;
    setError("");
    try {
      await changeLanguage(value);
    } catch (err) {
      console.error(err);
      setError("Could not save your choice. It will be used on this device only.");
    }
  }

  return (
    <div>
      <PageHeader title="Language" backTo="/profile" />
      <div className={styles.page}>
        <div className={styles.optionsList}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              className={styles.option}
              onClick={() => handleSelect(lang.value)}
            >
              <span>{lang.label}</span>
              {lang.value === language && <Check size={18} className={styles.check} />}
            </button>
          ))}
        </div>

        <p className={styles.note}>
          This changes the language of titles, descriptions and biographies
          that come from TMDB. The app interface is always in English.
          Where a translation is missing, the original text is shown.
        </p>
        {error && <p className={styles.note}>{error}</p>}
      </div>
    </div>
  );
}

export default Language;
