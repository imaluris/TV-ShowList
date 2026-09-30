import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "./About.module.css";

function About() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/profile" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Informazioni sull'app</h1>
      </div>

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
  );
}

export default About;