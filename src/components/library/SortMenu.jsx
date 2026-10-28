import { useState, useEffect, useRef } from "react";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";
import styles from "./SortMenu.module.css";

// Menu di ordinamento nello stile degli altri menu dell'app.
// Props: options [{value, label}], value (opzione scelta), onChange(value).
function SortMenu({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const current = options.find((option) => option.value === value) || options[0];

  // Si chiude cliccando fuori o premendo Esc.
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleSelect(optionValue) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={open ? styles.triggerOpen : styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort library: ${current.label}`}
      >
        <ArrowUpDown size={16} aria-hidden="true" />
        <span className={styles.label}>{current.label}</span>
        <ChevronDown
          size={16}
          className={open ? styles.chevronOpen : styles.chevron}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={styles.menu} role="listbox">
          {options.map((option) => {
            const isActive = option.value === current.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                className={isActive ? styles.optionActive : styles.option}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {isActive && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SortMenu;
