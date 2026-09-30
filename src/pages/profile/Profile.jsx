import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ProfileRow from "../../components/profile/ProfileRow";
import { User, Palette, Globe, Tags, Bell, Info, Settings } from "lucide-react";
import styles from "./Profile.module.css";

function Profile() {
  const { currentUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <div className={styles.profilePage}>
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          <User size={36} />
        </div>
        <p className={styles.email}>{currentUser?.email}</p>
      </div>

      <div className={styles.rowsList}>
        <ProfileRow icon={Palette} label="Aspetto" to="/profile/appearance" />
        <ProfileRow icon={Globe} label="Regione e lingua" to="/profile/language" />
        <ProfileRow icon={Tags} label="Generi preferiti" to="/profile/genres" />
        <ProfileRow
          icon={Bell}
          label="Notifiche nuovi episodi"
          toggle={{ checked: notificationsEnabled }}
          onToggleChange={setNotificationsEnabled}
        />
        <ProfileRow icon={Info} label="Informazioni sull'app" to="/profile/about" />
        <ProfileRow icon={Settings} label="Impostazioni account" to="/profile/account" />
      </div>
    </div>
  );
}

export default Profile;