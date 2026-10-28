import { useAuth } from "../../contexts/AuthContext";
import ProfileRow from "../../components/profile/ProfileRow";
import { User, Palette, Globe, Tags, Bell, Info, Settings, BarChart3 } from "lucide-react";
import styles from "./Profile.module.css";

function Profile() {
  const { currentUser } = useAuth();

  return (
    <div className={styles.profilePage}>
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt=""
              className={styles.avatarImage}
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={36} />
          )}
        </div>
        {currentUser?.displayName && (
          <p className={styles.name}>{currentUser.displayName}</p>
        )}
        <p className={styles.email}>{currentUser?.email}</p>
      </div>

      <div className={styles.rowsList}>
        <ProfileRow icon={BarChart3} label="Statistics" to="/profile/stats" />
        <ProfileRow icon={Palette} label="Appearance" to="/profile/appearance" />
        <ProfileRow icon={Globe} label="Language" to="/profile/language" />
        <ProfileRow icon={Tags} label="Favorite genres" to="/profile/genres" />
        <ProfileRow icon={Bell} label="Notifications" to="/profile/notifications" />
        <ProfileRow icon={Info} label="About the app" to="/profile/about" />
        <ProfileRow icon={Settings} label="Account settings" to="/profile/account" />
      </div>
    </div>
  );
}

export default Profile;