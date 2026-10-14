import { createContext } from "react";

// Contiene la funzione confirm(options) -> Promise<boolean>.
// Il provider è in ConfirmProvider.jsx, l'hook in hooks/useConfirm.js.
export const ConfirmContext = createContext(null);
