import { Link } from "react-router-dom";
import { IMG_URL } from "../../services/tmdb";
import styles from "./CastCard.module.css";

function CastCard({ member }) {
  const photoSrc = member.profile_path
    ? `${IMG_URL}${member.profile_path}`
    : "https://placehold.co/100x100?text=?";

  const character = member.roles?.[0]?.character || "";

  return (
    <Link to={`/person/${member.id}`} className={styles.card}>
      <img src={photoSrc} alt={member.name} />
      <p className={styles.name}>{member.name}</p>
      <p className={styles.character}>{character}</p>
    </Link>
  );
}

export default CastCard;