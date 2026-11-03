import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Quando si apre una nuova pagina (link, menu, bottone) la riporta in cima.
// Senza, la nuova pagina eredita lo scroll di quella precedente e si apre già
// in fondo. Con "indietro/avanti" (POP) non fa nulla: lo scroll lo gestisce il
// browser.
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
}

export default ScrollToTop;
