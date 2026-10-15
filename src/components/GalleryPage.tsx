import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import galleryFile from "../data/gallery.json";
import { SITE } from "../data/site";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { IconClose } from "./Icons";

const photos = galleryFile.photos;

export function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const photo = active === null ? null : photos[active];
  useFocusTrap(active !== null, dialogRef);

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = "Gallery | Suzuki Parts USA";
    meta?.setAttribute(
      "content",
      "Customer photos from the Suzuki Parts USA gallery. Send your shots to support@suzukipartsusa.com.",
    );
    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, []);

  useEffect(() => {
    if (active === null) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
      } else if (event.key === "ArrowRight") {
        setActive((current) => (current === null ? current : (current + 1) % photos.length));
      } else if (event.key === "ArrowLeft") {
        setActive((current) => (current === null ? current : (current - 1 + photos.length) % photos.length));
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  return (
    <div className="catalog-page">
      <header className="catalog-intro">
        <div className="container">
          <p className="eyebrow-dash">Gallery</p>
          <h1>Gallery</h1>
          <p>
            Send us an email with some of your best shots –{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
      </header>
      <div className="container">
        <ul className="gallery-grid">
          {photos.map((item, index) => (
            <li key={item.src}>
              <button type="button" onClick={() => setActive(index)} aria-label={`Open photo ${index + 1}`}>
                <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <AnimatePresence>
        {photo && active !== null ? (
          <motion.div
            className="gallery-lightbox"
            role="presentation"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setActive(null);
              }
            }}
          >
            <motion.div
              ref={dialogRef}
              className="gallery-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={photo.alt}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              <div className="gallery-dialog-bar">
                <p>
                  Photo {active + 1} of {photos.length}
                </p>
                <button ref={closeRef} type="button" className="icon-button" onClick={() => setActive(null)} aria-label="Close photo">
                  <IconClose />
                </button>
              </div>
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
              {photo.alt !== "Customer photo from the Suzuki Parts USA gallery" ? <p>{photo.alt}</p> : null}
              <div className="gallery-dialog-nav">
                <button type="button" onClick={() => setActive((active - 1 + photos.length) % photos.length)}>
                  Previous
                </button>
                <button type="button" onClick={() => setActive((active + 1) % photos.length)}>
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
