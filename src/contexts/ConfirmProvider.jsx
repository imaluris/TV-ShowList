import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ConfirmContext } from "./confirmContext";
import styles from "./ConfirmProvider.module.css";

// Sostituisce window.confirm con una finestra nello stile dell'app.
function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const close = useCallback((result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  // Esc = annulla
  useEffect(() => {
    if (!options) return;
    function handleKey(event) {
      if (event.key === "Escape") close(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [options, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options &&
        createPortal(
          <div className={styles.overlay} onClick={() => close(false)}>
            <div
              className={styles.dialog}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="confirm-title" className={styles.title}>
                {options.title}
              </h2>
              {options.message && (
                <p className={styles.message}>{options.message}</p>
              )}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={() => close(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  autoFocus
                  className={options.danger ? styles.danger : styles.confirm}
                  onClick={() => close(true)}
                >
                  {options.confirmLabel || "Confirm"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
