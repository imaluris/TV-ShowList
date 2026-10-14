import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { hasPasswordProvider } from "../../services/auth";
import {
  requestEmailChange,
  changePassword,
  changeDisplayName,
  getAuthErrorMessage,
} from "../../services/account";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./AccountForm.module.css";

function AccountEdit() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const usesPassword = hasPasswordProvider(currentUser);

  const [displayName, setDisplayName] = useState(currentUser.displayName || "");
  const [nameStatus, setNameStatus] = useState({ error: "", success: "" });
  const [nameBusy, setNameBusy] = useState(false);

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

  async function handleNameSubmit(event) {
    event.preventDefault();
    setNameStatus({ error: "", success: "" });
    setNameBusy(true);

    try {
      await changeDisplayName(displayName.trim());
      // Ricarica l'utente così il nuovo nome appare subito nel profilo.
      await refreshCurrentUser();
      setNameStatus({ error: "", success: "Name updated." });
    } catch (err) {
      setNameStatus({ error: getAuthErrorMessage(err), success: "" });
    } finally {
      setNameBusy(false);
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setEmailStatus({ error: "", success: "" });
    setEmailBusy(true);

    try {
      await requestEmailChange(emailForm.password, emailForm.newEmail.trim());
      setEmailStatus({
        error: "",
        success: `We sent a confirmation link to ${emailForm.newEmail.trim()}. Your email will change once you open it.`,
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
      setPasswordStatus({ error: "The two new passwords don't match.", success: "" });
      return;
    }

    setPasswordBusy(true);

    try {
      await changePassword(passwordForm.password, passwordForm.newPassword);
      setPasswordStatus({ error: "", success: "Password updated." });
      setPasswordForm({ password: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPasswordStatus({ error: getAuthErrorMessage(err), success: "" });
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Edit account" backTo="/profile/account" />
      <div className={styles.page}>

      <section className={styles.section}>
        <h2>Name</h2>
        <p className={styles.hint}>The name shown on your profile.</p>

        <form onSubmit={handleNameSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitButton} disabled={nameBusy}>
            {nameBusy ? "Saving..." : "Save name"}
          </button>
        </form>

        {nameStatus.error && <p className={styles.error}>{nameStatus.error}</p>}
        {nameStatus.success && <p className={styles.success}>{nameStatus.success}</p>}
      </section>

      {usesPassword ? (
        <>
        <section className={styles.section}>
          <h2>Email</h2>
          <p className={styles.hint}>
            Current email: {currentUser.email}. For security, your current password is required.
          </p>

          <form onSubmit={handleEmailSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="New email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Current password"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.submitButton} disabled={emailBusy}>
              {emailBusy ? "Sending..." : "Change email"}
            </button>
          </form>

          {emailStatus.error && <p className={styles.error}>{emailStatus.error}</p>}
          {emailStatus.success && <p className={styles.success}>{emailStatus.success}</p>}
        </section>

        <section className={styles.section}>
          <h2>Password</h2>
          <p className={styles.hint}>Choose a new password of at least 6 characters.</p>

          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.password}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, password: e.target.value })
              }
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Repeat the new password"
              value={passwordForm.confirm}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirm: e.target.value })
              }
              className={styles.input}
              required
            />
            <button type="submit" className={styles.submitButton} disabled={passwordBusy}>
              {passwordBusy ? "Saving..." : "Change password"}
            </button>
          </form>

          {passwordStatus.error && <p className={styles.error}>{passwordStatus.error}</p>}
          {passwordStatus.success && (
            <p className={styles.success}>{passwordStatus.success}</p>
          )}
        </section>
        </>
      ) : (
        <section className={styles.section}>
          <h2>Google sign-in</h2>
          <p className={styles.hint}>
            You signed in with Google ({currentUser.email}): your email and
            password are managed from your Google account.
          </p>
        </section>
      )}
      </div>
    </div>
  );
}

export default AccountEdit;
