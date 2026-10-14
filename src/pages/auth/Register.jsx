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
      <div className={styles.brand}>
        <span className={styles.mark}>
          <span className={styles.play} />
        </span>
        <span className={styles.brandName}>TV ShowList</span>
      </div>

      <div className={styles.authCard}>
        <h1 className={styles.title}>Sign up</h1>
        <p className={styles.subtitle}>Create an account to get started</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={nomeUtente}
            onChange={(e) => setNomeUtente(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitButton}>
            Sign up
          </button>
        </form>

        {messaggioErrore}

        <GoogleButton label="Sign up with Google" />

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.footerLink}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;