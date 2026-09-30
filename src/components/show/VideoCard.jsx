import styles from "./VideoCard.module.css";

function VideoCard({ video }) {
  const thumbnail = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.key}`;

  return (
    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <img src={thumbnail} alt={video.name} />
      <span className={styles.playIcon}>▶</span>
    </a>
  );
}

export default VideoCard;