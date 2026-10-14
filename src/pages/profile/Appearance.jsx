import { Check } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./Appearance.module.css";

const OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Appearance" backTo="/profile" />
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
        With "System", the app follows your device's light or dark theme.
      </p>
      </div>
    </div>
  );
}

export default Appearance;
