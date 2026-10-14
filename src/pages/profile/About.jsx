import PageHeader from "../../components/ui/PageHeader";
import styles from "./About.module.css";

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
          .
        </p>
      </div>
      </div>
    </div>
  );
}

export default About;