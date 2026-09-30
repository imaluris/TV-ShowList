import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import styles from "./ProfileRow.module.css";

function ProfileRow({ icon: Icon, label, to, toggle, onToggleChange }) {
  const content = (
    <>
      <div className={styles.left}>
        <Icon size={20} />
        <span>{label}</span>
      </div>

      {toggle ? (
        <button
          type="button"
          role="switch"
          aria-checked={toggle.checked}
          className={toggle.checked ? styles.switchOn : styles.switchOff}
          onClick={(e) => {
            e.preventDefault();
            onToggleChange(!toggle.checked);
          }}
        >
          <span className={styles.switchThumb} />
        </button>
      ) : (
        <ChevronRight size={18} className={styles.chevron} />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={styles.row}>
        {content}
      </Link>
    );
  }

  return <div className={styles.row}>{content}</div>;
}

export default ProfileRow;