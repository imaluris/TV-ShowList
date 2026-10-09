import PageHeader from "../../components/ui/PageHeader";
import styles from "./About.module.css";

function About() {
  return (
    <div>
      <PageHeader title="Informazioni sull'app" backTo="/profile" />
      <div className={styles.page}>

      <div className={styles.card}>
        <p className={styles.appName}>TV ShowList</p>
        <p className={styles.version}>Versione 1.0.0</p>
        <p className={styles.description}>
          TV ShowList ti aiuta a tenere traccia dei film e delle serie tv che
          guardi, stai guardando o vuoi vedere, usando i dati di{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            The Movie Database (TMDB)
          </a>
          .
        </p>
      </div>
      </div>
    </div>
  );
}

export default About;