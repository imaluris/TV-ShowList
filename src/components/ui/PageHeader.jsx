import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "./PageHeader.module.css";

// Intestazione delle pagine interne: resta in alto mentre scorri, con
// pulsante indietro, titolo (e logo) e, a destra, un'azione opzionale.
function PageHeader({ title, backTo, logo, action }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {backTo ? (
          <Link to={backTo} className={styles.back} aria-label="Indietro">
            <ArrowLeft size={20} />
          </Link>
        ) : (
          <span className={styles.spacer} />
        )}

        <div className={styles.titleWrap}>
          {logo}
          <h1 className={styles.title}>{title}</h1>
        </div>

        {action ? <div className={styles.action}>{action}</div> : <span className={styles.spacer} />}
      </div>
    </header>
  );
}

export default PageHeader;
