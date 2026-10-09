import { Play } from "lucide-react";
import styles from "./VideoCard.module.css";

function VideoCard({ video }) {
  const thumbnail = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.key}`;

  return (
    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <img src={thumbnail} alt={video.name} loading="lazy" />
      <span className={styles.playIcon}>
        <Play size={22} fill="currentColor" />
      </span>
    </a>
  );
}

export default VideoCard;