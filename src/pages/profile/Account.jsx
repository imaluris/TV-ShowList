import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { UserCog, Trash2, LogOut } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./Account.module.css";

function Account() {
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Errore durante il logout:", err);
    }
  }

  return (
    <div>
      <PageHeader title="Impostazioni account" backTo="/profile" />
      <div className={styles.page}>

      <div className={styles.buttonsList}>
        <Link to="/profile/account/edit" className={styles.actionButton}>
          <UserCog size={20} />
          <span>Modifica account</span>
        </Link>

        <Link to="/profile/account/delete" className={styles.dangerButton}>
          <Trash2 size={20} />
          <span>Elimina account</span>
        </Link>

        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
      </div>
    </div>
  );
}

export default Account;