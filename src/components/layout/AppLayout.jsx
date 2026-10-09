import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import styles from "./AppLayout.module.css";

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {isHome && <TopBar />}
      <div className={isHome ? styles.content : styles.contentNoTopBar}>
        <div key={location.pathname} className={styles.page}>
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </>
  );
}

export default AppLayout;