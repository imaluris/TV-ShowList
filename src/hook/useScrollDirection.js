import { useState, useEffect, useRef } from "react";

/**
 * Restituisce "up" o "down" a seconda della direzione in cui l'utente sta
 * scrollando. Vicino alla cima della pagina resta sempre "up" (mostra le
 * barre), così non spariscono subito appena la pagina si carica.
 */
export function useScrollDirection() {
  const [direction, setDirection] = useState("up");
  const lastScrollY = useRef(0);

  useEffect(() => {
    function updateDirection() {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setDirection("up");
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setDirection("up");
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", updateDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateDirection);
  }, []);

  return direction;
}