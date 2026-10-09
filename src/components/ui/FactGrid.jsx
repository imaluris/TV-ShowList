import styles from "./FactGrid.module.css";

// Griglia di "schede dato": etichetta piccola + valore. Salta i dati vuoti.
function FactGrid({ facts }) {
  const visible = facts.filter((fact) => fact.value);

  if (visible.length === 0) return null;

  return (
    <dl className={styles.grid}>
      {visible.map(({ label, value }) => (
        <div key={label} className={styles.fact}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default FactGrid;
