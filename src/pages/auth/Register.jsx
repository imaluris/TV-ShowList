import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import GoogleButton from "../../components/auth/GoogleButton";
import styles from "./Register.module.css";

function Register() {
  const [nomeUtente, setNomeUtente] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(auth.currentUser, { displayName: nomeUtente });
      await sendEmailVerification(auth.currentUser);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  let messaggioErrore = null;
  if (error) {
    messaggioErrore = <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Registrati</h1>
        <p className={styles.subtitle}>Crea un account per iniziare</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Nome utente"
            value={nomeUtente}
            onChange={(e) => setNomeUtente(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitButton}>
            Registrati
          </button>
        </form>

        {messaggioErrore}

        <GoogleButton label="Registrati con Google" />

        <p className={styles.footerText}>
          Hai già un account?{" "}
          <Link to="/login" className={styles.footerLink}>
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;