import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import styles from "./AppLayout.module.css";

function AppLayout() {
  return (
    <>
      <TopBar />
      <div className={styles.content}>
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

export default AppLayout;