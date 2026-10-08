import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "theme-preference";
const THEME_COLORS = { dark: "#0c0d10", light: "#f6f4ee" };

const ThemeContext = createContext(null);

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

// Applica il tema all'elemento <html> (le variabili CSS in index.css
// cambiano di conseguenza) e al colore della barra del browser.
function applyTheme(resolved) {
  document.documentElement.dataset.theme = resolved;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[resolved]);
}

export function ThemeProvider({ children }) {
  // "system" | "light" | "dark": è la scelta dell'utente.
  const [theme, setTheme] = useState(readPreference);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage non disponibile: la scelta vale solo per questa sessione
    }

    if (theme !== "system") {
      applyTheme(theme);
      return;
    }

    // "Sistema": segue il tema del dispositivo, anche se cambia mentre l'app è aperta.
    const query = window.matchMedia("(prefers-color-scheme: light)");
    applyTheme(getSystemTheme());

    function handleChange() {
      applyTheme(getSystemTheme());
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme va usato dentro un ThemeProvider");
  }
  return context;
}
