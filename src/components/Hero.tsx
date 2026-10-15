import { motion, useReducedMotion } from "framer-motion";
import { SearchForm } from "./SearchForm";

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <img
        className="hero-photo"
        src="/assets/vehicles/samurai-mountain-hero.webp"
        alt=""
        width="1280"
        height="720"
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-shade" />
      <div className="container hero-copy">
        <motion.h1 id="hero-title" {...rise(0.08)}>
          <span className="hero-headline">Hard-to-Find</span>
          <span className="hero-headline">Suzuki Parts.</span>
          <span className="hero-tagline">Right Where You Need Them.</span>
        </motion.h1>
        <motion.p className="hero-lead" {...rise(0.2)}>
          Shop replacement parts for Suzuki Samurai, Sidekick, Tracker, Long Wheel Base / Gypsy King
          and other supported models.
        </motion.p>
        <motion.div {...rise(0.28)}>
          <SearchForm id="hero-search" />
        </motion.div>
      </div>
    </section>
  );
}
