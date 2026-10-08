import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { hasPasswordProvider } from "../../services/auth";
import { deleteAccount, getAuthErrorMessage } from "../../services/account";
import styles from "./AccountForm.module.css";

function AccountDelete() {
  const { currentUser } = useAuth();
  const usesPassword = hasPasswordProvider(currentUser);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await deleteAccount(password);
      // Non serve navigare: con l'utente eliminato, ProtectedRoute
      // porta da solo alla pagina di login.
    } catch (err) {
      console.error("Errore durante l'eliminazione dell'account:", err);
      setError(getAuthErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/profile/account" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Elimina account</h1>
      </div>

      <section className={styles.section}>
        <h2>Questa azione è definitiva</h2>
        <p className={styles.hint}>
          Verranno eliminati il tuo account e tutti i tuoi dati: la libreria con le
          serie e i film, gli episodi visti e i generi preferiti. Non si può annullare.{" "}
          {usesPassword
            ? "Per confermare inserisci la tua password."
            : "Per confermare ti chiederemo di accedere di nuovo con Google."}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {usesPassword && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          )}
          <button type="submit" className={styles.dangerSubmitButton} disabled={busy}>
            {busy ? "Eliminazione..." : "Elimina definitivamente il mio account"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
      </section>
    </div>
  );
}

export default AccountDelete;
