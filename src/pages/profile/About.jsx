import PageHeader from "../../components/ui/PageHeader";
import styles from "./About.module.css";

// Riapre il banner dei cookie: cancella la scelta salvata e ricarica la pagina.
function handleChangeCookieChoice() {
  try {
    localStorage.removeItem("ga_consent");
  } catch {
    // se localStorage non è disponibile non c'è nulla da cancellare
  }
  window.location.reload();
}

function About() {
  return (
    <div>
      <PageHeader title="About the app" backTo="/profile" />
      <div className={styles.page}>

      <div className={styles.card}>
        <p className={styles.appName}>TV ShowList</p>
        <p className={styles.version}>Version 1.0.0</p>
        <p className={styles.description}>
          TV ShowList helps you keep track of the movies and TV shows you've
          watched, are watching, or want to watch, using data from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>

      <div className={styles.card}>
        <p className={styles.sectionTitle}>Privacy</p>
        <p className={styles.legal}>
          Your account (email, name) is handled by Firebase Authentication, and
          your library and preferences are stored in Firebase Firestore. Only
          you can read and edit them, and you can delete everything from
          Profile, Account, Delete account.
        </p>
        <p className={styles.legal}>
          If you accept cookies, the app uses Google Analytics to measure
          anonymous usage statistics. If you decline, no analytics data is
          collected. Your choice is saved in this browser.
        </p>
        <button
          type="button"
          className={styles.linkButton}
          onClick={handleChangeCookieChoice}
        >
          Change cookie choice
        </button>
      </div>
      </div>
    </div>
  );
}

export default About;
