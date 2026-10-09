import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function VerifyEmail() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshCurrentUser();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshCurrentUser]);

  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.brand}>
        <span className={styles.mark}>
          <span className={styles.play} />
        </span>
        <span className={styles.brandName}>TV ShowList</span>
      </div>

      <div className={styles.authCard}>
        <h1 className={styles.title}>Controlla la tua email</h1>
        <p className={styles.subtitle}>Un ultimo passaggio</p>
        <p className={styles.message}>
          Ti abbiamo mandato un link di conferma. Appena lo apri, entri
          automaticamente nell'app.
        </p>
        <button type="button" className={styles.secondaryButton} onClick={handleLogout}>
          Esci
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;
