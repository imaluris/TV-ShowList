import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Rail.module.css";

// Riga orizzontale scorrevole. Sul telefono si scorre col dito. Con il
// mouse: si può trascinare la riga, oppure usare le "zone" ai lati, che
// compaiono solo quando passi sopra la riga e solo se c'è altro da vedere
// in quella direzione.
function Rail({ children, className = "" }) {
  const rowRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const [dragging, setDragging] = useState(false);

  // Aggiorna quali frecce servono, in base a dove siamo nello scorrimento.
  const updateEdges = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const left = row.scrollLeft > 4;
    const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 4;
    setCanScroll((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    updateEdges();
    row.addEventListener("scroll", updateEdges, { passive: true });

    // Cambiano le dimensioni (finestra, immagini che si caricano): ricalcola.
    const observer = new ResizeObserver(updateEdges);
    observer.observe(row);
    Array.from(row.children).forEach((child) => observer.observe(child));

    return () => {
      row.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges, children]);

  function scrollByPage(direction) {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" });
  }

  // Trascinamento col mouse (sul touch ci pensa il browser).
  function handlePointerDown(event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScroll: rowRef.current.scrollLeft,
      moved: false,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag.active) return;

    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 5) {
      drag.moved = true;
      setDragging(true);
    }
    if (drag.moved) {
      rowRef.current.scrollLeft = drag.startScroll - delta;
    }
  }

  function handlePointerEnd() {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
  }

  // Dopo un trascinamento il click sui link va ignorato, altrimenti
  // aprirebbe la card su cui hai rilasciato il mouse.
  function handleClickCapture(event) {
    if (dragRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current.moved = false;
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.edge} ${styles.edgeLeft} ${canScroll.left ? styles.edgeOn : ""}`}
        onClick={() => scrollByPage(-1)}
        aria-label="Scroll back"
        tabIndex={canScroll.left ? 0 : -1}
      >
        <ChevronLeft size={28} strokeWidth={2.2} />
      </button>

      <div
        className={`${styles.row} ${dragging ? styles.dragging : ""} ${className}`}
        ref={rowRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </div>

      <button
        type="button"
        className={`${styles.edge} ${styles.edgeRight} ${canScroll.right ? styles.edgeOn : ""}`}
        onClick={() => scrollByPage(1)}
        aria-label="Scroll forward"
        tabIndex={canScroll.right ? 0 : -1}
      >
        <ChevronRight size={28} strokeWidth={2.2} />
      </button>
    </div>
  );
}

export default Rail;
