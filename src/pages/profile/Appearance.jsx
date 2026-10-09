import { Check } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./Appearance.module.css";

const OPTIONS = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" },
];

function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Aspetto" backTo="/profile" />
      <div className={styles.page}>

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
    </div>
  );
}

export default Appearance;
