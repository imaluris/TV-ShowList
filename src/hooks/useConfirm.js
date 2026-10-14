import { useContext } from "react";
import { ConfirmContext } from "../contexts/confirmContext";

// Uso: const confirm = useConfirm();
//      const ok = await confirm({ title, message, confirmLabel, danger });
export function useConfirm() {
  return useContext(ConfirmContext);
}
