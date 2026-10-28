import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import ProfileRow from "../../components/profile/ProfileRow";
import {
  isPushSupported,
  isInstalledApp,
  getPermission,
  isEnabledOnThisDevice,
  enableNotifications,
  disableNotifications,
} from "../../services/notifications";
import styles from "./Notifications.module.css";

const ERROR_MESSAGES = {
  "not-installed":
    "Install the app on this device first, then turn notifications on from the installed app.",
  "not-configured": "Notifications are not set up yet.",
  "permission-denied":
    "Notifications are blocked. Allow them for this site in your browser settings, then try again.",
  "no-service-worker":
    "Notifications need the installed web app or a published version of the site. They don't work in development mode.",
};

function Notifications() {
  const { currentUser } = useAuth();
  const [supported, setSupported] = useState(null);
  const [enabled, setEnabled] = useState(isEnabledOnThisDevice());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const installed = isInstalledApp();

  useEffect(() => {
    isPushSupported()
      .then(setSupported)
      .catch(() => setSupported(false));
  }, []);

  async function handleToggle(next) {
    if (!currentUser || busy) return;
    if (next && !installed) {
      setError(ERROR_MESSAGES["not-installed"]);
      return;
    }
    setBusy(true);
    setError("");
    // Aggiornamento immediato: l'interruttore risponde subito al tocco e
    // torna indietro solo se l'operazione fallisce.
    setEnabled(next);

    try {
      if (next) await enableNotifications(currentUser.uid);
      else await disableNotifications(currentUser.uid);
    } catch (err) {
      console.error(err);
      setError(ERROR_MESSAGES[err.code] || "Something went wrong. Please try again.");
      setEnabled(isEnabledOnThisDevice());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Notifications" backTo="/profile" />
      <div className={styles.page}>
        <div className={styles.rowsList}>
          <ProfileRow
            icon={Bell}
            label="Push notifications"
            toggle={{ checked: enabled }}
            onToggleChange={handleToggle}
          />
        </div>

        <p className={styles.description}>
          Get a notification when a new episode comes out for a show you are
          watching, or when a new season arrives for one you have finished.
          This setting applies to this device only.
        </p>

        {busy && (
          <p className={styles.description}>
            {enabled ? "Turning on..." : "Turning off..."}
          </p>
        )}

        {!installed && (
          <p className={styles.warning}>
            Notifications only work in the installed app. Install it first:
            on Android and computers use the browser menu, "Install app"; on
            iPhone and iPad tap Share, then "Add to Home Screen". Then open
            the app and turn them on here.
          </p>
        )}

        {supported === false && (
          <p className={styles.warning}>
            This browser doesn't support push notifications. On iPhone and iPad
            you need to install the app first (see below).
          </p>
        )}
        {supported && getPermission() === "denied" && !enabled && (
          <p className={styles.warning}>{ERROR_MESSAGES["permission-denied"]}</p>
        )}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.card}>
          <p className={styles.cardTitle}>Where do notifications work?</p>
          <ul className={styles.list}>
            <li>
              <strong>Android:</strong> install the app from Chrome (menu,
              "Install app"). Notifications arrive even when it's closed.
            </li>
            <li>
              <strong>iPhone and iPad:</strong> install the app (Share, then
              "Add to Home Screen"), with iOS 16.4 or newer. From the normal
              browser they don't arrive.
            </li>
            <li>
              <strong>Windows and Mac:</strong> install the app from Chrome or
              Edge (the install icon in the address bar). They arrive as long
              as the browser is running, even in the background.
            </li>
          </ul>
          <p className={styles.note}>
            You need to turn them on on each device separately. If you remove the
            app from a device, you stop receiving them there. You can also turn
            them off at any time here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
