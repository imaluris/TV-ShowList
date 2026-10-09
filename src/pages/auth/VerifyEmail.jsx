import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h1>Verifica la tua email</h1>
      <p>Ti abbiamo mandato un'email con un link di conferma. Appena la confermi, sarai reindirizzato automaticamente.</p>
      <button onClick={handleLogout}>Esci</button>
    </div>
  );
}

export default VerifyEmail;