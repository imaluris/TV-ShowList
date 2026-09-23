import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";

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
    messaggioErrore = <p>{error}</p>;
  }

  return (
    <div>
      <h1>Registrati</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome utente"
          value={nomeUtente}
          onChange={(e) => setNomeUtente(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 caratteri)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrati</button>
      </form>
      {messaggioErrore}
      <p>
        Hai già un account? <Link to="/login">Accedi</Link>
      </p>
    </div>
  );
}

export default Register;