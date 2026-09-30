import { useState } from "react";
import { useMediaType } from "../../contexts/MediaTypeContext";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import SearchOverlay from "./SearchOverlay";
import { Search } from "lucide-react";
import styles from "./TopBar.module.css";

function TopBar() {
  const { isMovie } = useMediaType();
  const scrollDirection = useScrollDirection();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div
        className={`${styles.topBar} ${
          scrollDirection === "down" ? styles.hidden : ""
        }`}
      >
        <button
          type="button"
          className={styles.searchTrigger}
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={18} />
          <span>{isMovie ? "Cerca un film..." : "Cerca una serie TV..."}</span>
        </button>
      </div>

      {isSearchOpen && (
        <SearchOverlay onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}

export default TopBar;