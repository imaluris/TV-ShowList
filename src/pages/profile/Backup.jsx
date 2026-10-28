import { useState, useRef } from "react";
import { Download, Upload } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import { createBackup, downloadJson, importBackup } from "../../services/backup";
import styles from "./Backup.module.css";

function Backup() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }

  async function handleExport() {
    if (!currentUser || busy) return;
    setBusy("export");
    setMessage(null);

    try {
      const backup = await createBackup(currentUser.uid);
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(backup, `tv-showlist-backup-${date}.json`);
      setMessage({
        type: "ok",
        text: `Backup saved: ${backup.items.length} titles.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Could not create the backup. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function handleFileChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permette di scegliere di nuovo lo stesso file
    if (!file || !currentUser || busy) return;

    setBusy("import");
    setMessage(null);

    try {
      const result = await importBackup(currentUser.uid, await file.text());
      const parts = [`${result.added} added`];
      if (result.existing) parts.push(`${result.existing} already in your library`);
      if (result.skipped) parts.push(`${result.skipped} skipped (invalid)`);
      setMessage({ type: "ok", text: `Backup restored: ${parts.join(", ")}.` });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message?.startsWith("This")
          ? err.message
          : "Could not restore the backup. Please try again.",
      });
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <PageHeader title="Backup" backTo="/profile" />
      <div className={styles.page}>
        <p className={styles.description}>
          Save your library (movies and TV shows to watch, in progress and
          watched, with the episodes you have seen) in a file, and restore it
          whenever you need, even on another account.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={handleExport}
            disabled={Boolean(busy)}
          >
            <Download size={18} />
            <span>{busy === "export" ? "Saving..." : "Export backup"}</span>
          </button>

          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => fileInputRef.current?.click()}
            disabled={Boolean(busy)}
          >
            <Upload size={18} />
            <span>{busy === "import" ? "Restoring..." : "Restore from backup"}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className={styles.fileInput}
            onChange={handleFileChosen}
          />
        </div>

        {message && (
          <p className={message.type === "ok" ? styles.success : styles.error}>
            {message.text}
          </p>
        )}

        <p className={styles.note}>
          Restoring only adds the titles that are missing: what is already in
          your library stays as it is. Preferences like favorite genres are not
          included in the backup.
        </p>
      </div>
    </div>
  );
}

export default Backup;
