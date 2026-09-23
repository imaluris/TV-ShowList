import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/");
  } catch (err) {
    setError(err.message);
  }
}

  return (
    <div>
      <h1>Accedi</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Accedi</button>
      </form>
      {error && <p>{error}</p>}
      <p>
        Non hai un account? <Link to="/register">Registrati</Link>
      </p>
    </div>
  );
}

export default Login;
