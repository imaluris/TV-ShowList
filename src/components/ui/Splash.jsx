import styles from "./Splash.module.css";

// Schermata mostrata mentre Firebase controlla se sei già loggato:
// solo il marchio che pulsa, niente testo.
function Splash() {
  return (
    <div className={styles.splash} aria-busy="true" aria-label="Caricamento">
      <div className={styles.mark}>
        <span className={styles.play} />
      </div>
    </div>
  );
}

export default Splash;
