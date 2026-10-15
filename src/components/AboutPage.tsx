import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IconArrow } from "./Icons";
import { Reveal } from "./Reveal";

const vehicleCredit = {
  title: "Suzuki Samurai at Rax, Austria",
  author: "GT1976",
  source: "https://commons.wikimedia.org/wiki/File:2017-11-02_(406)_Suzuki_Samurai_at_Rax,_Austria.jpg",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
};

export function AboutPage() {
  const reduce = useReducedMotion();
  const rise = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = "About Us | Suzuki Parts USA";
    meta?.setAttribute(
      "content",
      "Suzuki Parts USA has supplied high-quality, hard-to-find Suzuki parts for over 12 years.",
    );
    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, []);

  return (
    <>
      <section className="hero hero-about" aria-labelledby="about-page-title">
        <img
          className="hero-photo"
          src="/assets/photography/about-samurai-rax.webp"
          alt=""
          width="1920"
          height="1440"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-shade" />
        <div className="container hero-copy">
          <motion.div {...rise}>
            <p className="eyebrow-dash">About Us</p>
            <h1 id="about-page-title">
              About
              <br />
              Suzuki Parts USA
            </h1>
            <p className="hero-lead">
              For over 12 years, we’ve helped Suzuki owners find quality, hard-to-find parts to keep their
              vehicles on the road.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="about-story" aria-labelledby="about-story-title">
        <div className="container about-story-grid">
          <Reveal>
            <div className="about-story-copy">
              <p className="eyebrow-dash">Our Story</p>
              <h2 id="about-story-title">Helping Suzuki Owners Keep Moving.</h2>
              <p>
                Suzuki Parts USA has spent more than 12 years supplying high-quality, hard-to-find automotive
                parts for Suzuki vehicles. Our focus is on making it easier for Suzuki owners to find the parts
                they need to keep their vehicles on the road.
              </p>
              <p>
                Whether this is your first time shopping with us or you are a returning customer, we look
                forward to helping you find the right part.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="about-story-photo">
              <img
                src="/assets/photography/engine-valve-cover.webp"
                alt="Suzuki engine valve cover, gasket, and oil cap from the Suzuki Parts USA catalog"
                width="1400"
                height="1400"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="about-cta-section" aria-labelledby="about-cta-title">
        <div className="container">
          <Reveal>
            <div className="about-cta">
              <img
                src="/assets/photography/about-samurai-rax.webp"
                alt=""
                width="1920"
                height="1440"
                loading="lazy"
              />
              <div className="about-cta-shade" />
              <div className="about-cta-copy">
                <p className="eyebrow-dash">Need Help?</p>
                <h2 id="about-cta-title">Looking for a Specific Suzuki Part?</h2>
                <p>Explore our parts catalog or get in touch if you need help finding what you’re looking for.</p>
                <a className="btn about-cta-btn" href="/contact">
                  Contact Us <IconArrow />
                </a>
              </div>
            </div>
          </Reveal>
          <p className="faq-credit">
            Vehicle photo: <a href={vehicleCredit.source}>{vehicleCredit.title}</a> by {vehicleCredit.author},{" "}
            <a href={vehicleCredit.licenseUrl}>{vehicleCredit.license}</a>. The parts photo is from the Suzuki Parts
            USA catalog.
          </p>
        </div>
      </section>
    </>
  );
}
