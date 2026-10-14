import Section from "../ui/Section";
import styles from "./WatchProviders.module.css";

const LOGO_URL = "https://image.tmdb.org/t/p/w92";

// "Where to watch": servizi in abbonamento (streaming) dove il titolo è
// disponibile in Italia. Solo informazione, niente link.
// providers = risposta di getTitleWatchProviders (o null).
function WatchProviders({ providers }) {
  const list = providers?.flatrate || [];

  return (
    <Section title="Where to watch" aside="Italy">
      {list.length > 0 ? (
        <div className={styles.list}>
          {list.map((provider) => (
            <span key={provider.provider_id} className={styles.item}>
              <img
                src={`${LOGO_URL}${provider.logo_path}`}
                alt=""
                loading="lazy"
              />
              {provider.provider_name}
            </span>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Not available for streaming in Italy.</p>
      )}
    </Section>
  );
}

export default WatchProviders;
