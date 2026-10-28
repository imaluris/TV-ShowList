import styles from "./Splash.module.css";

// Schermata mostrata mentre Firebase controlla se sei già loggato:
// l'icona dell'app che pulsa, niente testo. Usa la stessa icona (e lo stesso
// fondo) della schermata di avvio di Android, così si vede un'unica icona.
function Splash() {
  return (
    <div className={styles.splash} aria-busy="true" aria-label="Loading">
      <img
        className={styles.mark}
        src={`${import.meta.env.BASE_URL}pwa/icon-512.png`}
        alt=""
        width="96"
        height="96"
      />
    </div>
  );
}

export default Splash;
