import { Link } from "react-router-dom";
import { IMG_URL } from "../../services/tmdb";
import styles from "./StreamingIcon.module.css";

function StreamingIcon({ provider }) {
  const content = (
    <>
      {provider.logo_path ? (
        <img src={`${IMG_URL}${provider.logo_path}`} alt={provider.provider_name} />
      ) : (
        <span>{provider.provider_name[0]}</span>
      )}
      <p>{provider.provider_name}</p>
    </>
  );

  if (!provider.provider_id) {
    return <div className={styles.icon}>{content}</div>;
  }

  return (
    <Link to={`/provider/${provider.provider_id}`} className={styles.icon}>
      {content}
    </Link>
  );
}

export default StreamingIcon;