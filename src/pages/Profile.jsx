import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { LogOut } from "lucide-react";
import styles from "./Profile.module.css";

function Profile() {
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Errore durante il logout:", err);
    }
  }

  return (
    <div className={styles.placeholderPage}>
      <h1>Profilo</h1>
      <p>In arrivo — qui potrai gestire il tuo account.</p>

      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default Profile;