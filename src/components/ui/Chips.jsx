import styles from "./Chips.module.css";

// Piccole etichette a pillola (generi, voto, durata...).
// items: stringhe oppure { label, accent: true, icon }
function Chips({ items }) {
  return (
    <>
      {items
        .filter(Boolean)
        .map((item) => {
          const chip = typeof item === "string" ? { label: item } : item;
          return (
            <span
              key={chip.label}
              className={chip.accent ? styles.chipAccent : styles.chip}
            >
              {chip.icon}
              {chip.label}
            </span>
          );
        })}
    </>
  );
}

export default Chips;
