import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  requestEmailChange,
  changePassword,
  getAuthErrorMessage,
} from "../../services/account";
import styles from "./AccountForm.module.css";

function AccountEdit() {
  const { currentUser } = useAuth();

  const [emailForm, setEmailForm] = useState({ password: "", newEmail: "" });
  const [emailStatus, setEmailStatus] = useState({ error: "", success: "" });
  const [emailBusy, setEmailBusy] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ error: "", success: "" });
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setEmailStatus({ error: "", success: "" });
    setEmailBusy(true);

    try {
      await requestEmailChange(emailForm.password, emailForm.newEmail.trim());
      setEmailStatus({
        error: "",
        success: `Ti abbiamo inviato un link di conferma a ${emailForm.newEmail.trim()}. L'email cambierà quando lo aprirai.`,
      });
      setEmailForm({ password: "", newEmail: "" });
    } catch (err) {
      setEmailStatus({ error: getAuthErrorMessage(err), success: "" });
    } finally {
      setEmailBusy(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordStatus({ error: "", success: "" });

    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordStatus({ error: "Le due nuove password non coincidono.", success: "" });
      return;
    }

    setPasswordBusy(true);

    try {
      await changePassword(passwordForm.password, passwordForm.newPassword);
      setPasswordStatus({ error: "", success: "Password aggiornata." });
      setPasswordForm({ password: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPasswordStatus({ error: getAuthErrorMessage(err), success: "" });
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/profile/account" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <h1>Modifica account</h1>
      </div>

      <section className={styles.section}>
        <h2>Email</h2>
        <p className={styles.hint}>
          Email attuale: {currentUser.email}. Per sicurezza serve la password attuale.
        </p>

        <form onSubmit={handleEmailSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Nuova email"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password attuale"
            value={emailForm.password}
            onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitButton} disabled={emailBusy}>
            {emailBusy ? "Invio..." : "Cambia email"}
          </button>
        </form>

        {emailStatus.error && <p className={styles.error}>{emailStatus.error}</p>}
        {emailStatus.success && <p className={styles.success}>{emailStatus.success}</p>}
      </section>

      <section className={styles.section}>
        <h2>Password</h2>
        <p className={styles.hint}>Scegli una nuova password di almeno 6 caratteri.</p>

        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <input
            type="password"
            placeholder="Password attuale"
            value={passwordForm.password}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, password: e.target.value })
            }
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Nuova password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Ripeti la nuova password"
            value={passwordForm.confirm}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirm: e.target.value })
            }
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitButton} disabled={passwordBusy}>
            {passwordBusy ? "Salvataggio..." : "Cambia password"}
          </button>
        </form>

        {passwordStatus.error && <p className={styles.error}>{passwordStatus.error}</p>}
        {passwordStatus.success && (
          <p className={styles.success}>{passwordStatus.success}</p>
        )}
      </section>
    </div>
  );
}

export default AccountEdit;
