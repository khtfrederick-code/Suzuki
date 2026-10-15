import { IconArrow } from "../Icons";

export function FAQSupportCTA() {
  return (
    <section className="faq-support" aria-labelledby="faq-support-title">
      <div className="container faq-support-bar">
        <div className="faq-support-photo">
          <img src="/assets/vehicles/samurai-mountain-hero.webp" alt="" width="640" height="360" />
        </div>
        <span className="faq-support-icon" aria-hidden="true">
          ?
        </span>
        <div className="faq-support-copy">
          <h2 id="faq-support-title">Still Have Questions?</h2>
          <p>Our team is happy to help with orders, shipping, or identifying the right part for your Suzuki.</p>
        </div>
        <div className="faq-support-actions">
          <a className="btn" href="/contact">
            Contact Us <IconArrow />
          </a>
          <a className="btn faq-support-shop" href="/shop">
            Browse Parts
          </a>
        </div>
      </div>
    </section>
  );
}
