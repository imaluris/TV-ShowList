import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./Appearance.module.css";

const OPTIONS = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" },
];

function Appearance() {
  const { theme, setTheme } = useTheme();

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
        Con "Sistema" l'app segue il tema chiaro o scuro del tuo dispositivo.
      </p>
    </div>
  );
}

export default Appearance;
