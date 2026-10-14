import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { hasPasswordProvider } from "../../services/auth";
import { deleteAccount, getAuthErrorMessage } from "../../services/account";
import PageHeader from "../../components/ui/PageHeader";
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
    <div>
      <PageHeader title="Delete account" backTo="/profile/account" />
      <div className={styles.page}>

      <section className={styles.section}>
        <h2>This action is permanent</h2>
        <p className={styles.hint}>
          Your account and all your data will be deleted: your library of
          TV shows and movies, watched episodes, and favorite genres. This can't be undone.{" "}
          {usesPassword
            ? "To confirm, enter your password."
            : "To confirm, we'll ask you to sign in with Google again."}
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
            {busy ? "Deleting..." : "Permanently delete my account"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
      </section>
      </div>
    </div>
  );
}

export default AccountDelete;
