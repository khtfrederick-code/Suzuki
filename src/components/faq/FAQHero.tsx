import { motion, useReducedMotion } from "framer-motion";
import { FAQSearch } from "./FAQSearch";

type FAQHeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function FAQHero({ query, onQueryChange }: FAQHeroProps) {
  const reduce = useReducedMotion();
  const rise = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section className="faq-hero" aria-labelledby="faq-title">
      <img
        src="/assets/vehicles/clearance-grille.webp"
        alt=""
        width="1600"
        height="900"
        fetchPriority="high"
        decoding="async"
      />
      <div className="faq-hero-shade" />
      <div className="container faq-hero-copy">
        <motion.div {...rise}>
          <p className="eyebrow-dash light">FAQ</p>
          <h1 id="faq-title">Frequently Asked Questions</h1>
          <p>
            Find answers about shipping, payments, returns, and ordering from Suzuki Parts USA.
          </p>
          <FAQSearch id="faq-search" value={query} onChange={onQueryChange} />
        </motion.div>
      </div>
    </section>
  );
}
