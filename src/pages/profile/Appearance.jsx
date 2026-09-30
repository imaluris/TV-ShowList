import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import styles from "./Appearance.module.css";

const OPTIONS = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" },
];

function Appearance() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme-preference") || "system",
  );

  useEffect(() => {
    localStorage.setItem("theme-preference", theme);
  }, [theme]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/profile" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Aspetto</h1>
      </div>

      <div className={styles.optionsList}>
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.option}
            onClick={() => setTheme(option.value)}
          >
            <span>{option.label}</span>
            {theme === option.value && <Check size={18} className={styles.check} />}
          </button>
        ))}
      </div>

      <p className={styles.note}>
        Il cambio tema effettivo non è ancora attivo: per ora l'app resta sempre scura.
      </p>
    </div>
  );
}

export default Appearance;