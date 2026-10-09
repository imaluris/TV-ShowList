import styles from "./Section.module.css";

// Blocco di pagina con titolo: tiene ovunque la stessa spaziatura.
function Section({ title, aside, children, className = "" }) {
  return (
    <section className={`${styles.section} ${className}`}>
      {title && (
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          {aside && <span className={styles.aside}>{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export default Section;
