import { Bookmark, Check, RotateCcw, Trash2 } from "lucide-react";
import { LIBRARY_STATUS } from "../../services/firestore";

// Logica del menu dello stato (condivisa da LibraryStatusButtons e ShowCard).

export const OPTIONS = [
  { value: LIBRARY_STATUS.TO_WATCH, label: "To watch", icon: Bookmark },
  { value: LIBRARY_STATUS.WATCHED, label: "Watched", icon: Check },
];

// Voci speciali: non sono stati.
// "Reset" riporta la serie a "Da vedere" cancellando le spunte,
// "Remove" la toglie del tutto dalla libreria.
export const RESET_VALUE = "reset";
export const REMOVE_VALUE = "remove";
const RESET_OPTION = { value: RESET_VALUE, label: "Reset", icon: RotateCcw };
const REMOVE_OPTION = { value: REMOVE_VALUE, label: "Remove", icon: Trash2 };

// Una serie TV è "iniziata" se è in corso o vista: ha del progresso da perdere.
export function isStartedSeries(status, mediaType) {
  return (
    mediaType === "tv" &&
    (status === LIBRARY_STATUS.WATCHING || status === LIBRARY_STATUS.WATCHED)
  );
}

// Quali voci mostrare nel menu in base allo stato attuale.
export function getVisibleOptions(status, mediaType) {
  // Non è in libreria: si può solo aggiungerla.
  if (!status) return OPTIONS;

  const started = isStartedSeries(status, mediaType);

  // Stati scegliibili: mai quello attuale, e mai "Da vedere"
  // per una serie già iniziata (per quello c'è "Reset").
  const stateOptions = OPTIONS.filter(
    (option) =>
      option.value !== status &&
      !(started && option.value === LIBRARY_STATUS.TO_WATCH),
  );

  return [...stateOptions, ...(started ? [RESET_OPTION] : []), REMOVE_OPTION];
}
