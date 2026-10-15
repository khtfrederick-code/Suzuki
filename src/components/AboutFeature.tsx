import { IconArrow } from "./Icons";
import { Reveal } from "./Reveal";

export function AboutFeature() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container about-split">
        <Reveal>
          <div className="about-photo">
            <img
              src="/assets/photography/engine-valve-cover.webp"
              alt="Suzuki engine valve cover, gasket, and oil cap from the Suzuki Parts USA catalog"
              width="1400"
              height="1400"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="about-copy">
            <h2 id="about-title">Specializing in Suzuki Parts</h2>
            <p>
              We focus on hard-to-find Suzuki parts for Samurai, Sidekick, Tracker, Long Wheel Base /
              Gypsy King, and other supported models. Suzuki Parts USA has been serving customers with
              high-quality parts for over 12 years, with free shipping on most parts.
            </p>
            <p>
              Parts are stocked in Kentucky. Orders are often shipped the next business day and may
              ship within three business days of purchase.
            </p>
            <a className="btn" href="/about">
              About Us <IconArrow />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
