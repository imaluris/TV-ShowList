import Section from "../ui/Section";
import styles from "./WatchProviders.module.css";

const LOGO_URL = "https://image.tmdb.org/t/p/w92";

const GROUPS = [
  { key: "flatrate", label: "Stream" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
];

// "Where to watch": logo dei servizi dove il titolo è disponibile (Italia).
// providers = risposta di getTitleWatchProviders (o null).
function WatchProviders({ providers }) {
  const groups = GROUPS.filter(
    (group) => providers?.[group.key]?.length > 0,
  );

  return (
    <Section title="Where to watch" aside="Italy">
      {groups.length > 0 ? (
        <div className={styles.groups}>
          {groups.map((group) => (
            <div key={group.key} className={styles.group}>
              <span className={styles.label}>{group.label}</span>
              <div className={styles.logos}>
                {providers[group.key].map((provider) => (
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
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Not available for streaming in Italy.</p>
      )}
      <p className={styles.credit}>Streaming data by JustWatch</p>
    </Section>
  );
}

export default WatchProviders;
