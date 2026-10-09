import styles from "./SegmentedControl.module.css";

// Selettore a pillola: l'indicatore colorato scorre sulla voce scelta.
// options: [{ value, label }]
function SegmentedControl({ options, value, onChange, label }) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div
      className={styles.control}
      role="tablist"
      aria-label={label}
      style={{ "--count": options.length, "--index": index }}
    >
      <span className={styles.indicator} aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={option.value === value ? styles.optionActive : styles.option}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedControl;
