import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { IconClose } from "./Icons";
import { SearchForm } from "./SearchForm";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="search-overlay"
          role="presentation"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            ref={panelRef}
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-overlay-title"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
          >
            <div className="search-panel-head">
              <h2 id="search-overlay-title">Search parts</h2>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Close search">
                <IconClose />
              </button>
            </div>
            <p>Search the Suzuki Parts USA catalog by part name, keyword, model, or part number.</p>
            <SearchForm id="overlay-search" variant="overlay" autoFocus />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
