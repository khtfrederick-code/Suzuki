import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clearanceProducts } from "../data/products";
import { formatMoney } from "../lib/format";
import { IconArrow } from "./Icons";
import { Reveal } from "./Reveal";

export function ClearanceFeature() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const product = clearanceProducts[index];
  const count = clearanceProducts.length;

  useEffect(() => {
    if (reduce || paused || count < 2) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [count, paused, reduce]);

  if (!product) {
    return null;
  }

  const showPrevious = () => setIndex((current) => (current - 1 + count) % count);
  const showNext = () => setIndex((current) => (current + 1) % count);

  return (
    <section className="section clearance-section" id="clearance" aria-labelledby="clearance-title">
      <div className="container">
        <Reveal>
          <div
            className="clearance"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="clearance-promo">
              <img
                src="/assets/vehicles/clearance-grille.webp"
                alt=""
                width="1600"
                height="1154"
                loading="lazy"
              />
              <div className="clearance-promo-copy">
                <p className="eyebrow light">Save on select inventory</p>
                <h2 id="clearance-title">Clearance Parts</h2>
                <p>Explore discounted parts while supplies last. Clearance items are not returnable.</p>
                <a className="btn btn-red" href="/shop/clearance">
                  Shop Clearance <IconArrow />
                </a>
              </div>
            </div>

            <article className="clearance-product" aria-live="polite">
              <div className="clearance-nav">
                <button type="button" onClick={showPrevious} aria-label="Previous clearance part">
                  Previous
                </button>
                <button type="button" onClick={showNext} aria-label="Next clearance part">
                  Next
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  className="clearance-details"
                  key={product.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduce ? 0 : 0.25 }}
                >
                  <a className="clearance-photo" href={product.url}>
                    <img src={product.image} alt={product.imageAlt} width="800" height="800" />
                  </a>
                  <div className="clearance-copy">
                    <p className="sale-flag">Sale</p>
                    <h3>
                      <a href={product.url}>{product.name}</a>
                    </h3>
                    <p className="compat">{product.compatibility}</p>
                    {product.note ? <p className="note">{product.note}</p> : null}
                    <p className="price-row">
                      <span className="price">{formatMoney(product.price)}</span>
                      {product.compareAtPrice ? (
                        <s className="compare">{formatMoney(product.compareAtPrice)}</s>
                      ) : null}
                    </p>
                    <p className={`stock${product.stock === "in-stock" ? " is-in" : " is-out"}`}>
                      <span className="stock-dot" aria-hidden="true" />
                      {product.stock === "in-stock" ? "In stock when imported" : "Out of stock when imported"}
                    </p>
                    <a className="text-link" href={product.url}>
                      View part <IconArrow />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="clearance-dots" role="tablist" aria-label="Featured clearance parts">
                {clearanceProducts.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={itemIndex === index}
                    aria-label={`Show ${item.name}`}
                    className={itemIndex === index ? "is-active" : ""}
                    onClick={() => setIndex(itemIndex)}
                  />
                ))}
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
