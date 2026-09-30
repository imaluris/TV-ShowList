import { NavLink } from "react-router-dom";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { Home as HomeIcon, Library, User } from "lucide-react";
import styles from "./BottomNav.module.css";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/library", label: "Libreria", icon: Library },
  { to: "/profile", label: "Profilo", icon: User },
];

function BottomNav() {
  const scrollDirection = useScrollDirection();

  return (
    <nav
      className={`${styles.bottomNav} ${
        scrollDirection === "down" ? styles.hidden : ""
      }`}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? styles.navItemActive : styles.navItem
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;