import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { touchNotificationDevice } from "../../services/notifications";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import styles from "./AppLayout.module.css";

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { currentUser } = useAuth();

  // Ogni apertura dell'app installata segna il dispositivo come attivo.
  useEffect(() => {
    if (currentUser) touchNotificationDevice(currentUser.uid);
  }, [currentUser]);

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