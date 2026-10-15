import { useEffect } from "react";
import { SITE } from "../data/site";

export function ReturnsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = "Refund and Returns Policy | Suzuki Parts USA";
    meta?.setAttribute(
      "content",
      "Refund and returns policy for Suzuki Parts USA. The published policy lasts 30 days.",
    );
    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, []);

  return (
    <div className="catalog-page">
      <header className="catalog-intro">
        <div className="container">
          <p className="eyebrow-dash">Customer Service</p>
          <h1>Refund and Returns Policy</h1>
        </div>
      </header>
      <article className="policy container">
        <section aria-labelledby="returns-overview">
          <h2 id="returns-overview">Overview</h2>
          <p>
            Our refund and returns policy lasts 30 days. If 30 days have passed since your purchase, we can’t
            offer you a full refund or exchange.
          </p>
          <p>
            To be eligible for a return, your item must be unused and in the same condition that you received it.
            It must also be in the original packaging.
          </p>
        </section>
        <section aria-labelledby="returns-refunds">
          <h2 id="returns-refunds">Refunds</h2>
          <p>
            Once your return is received and inspected, then your refund will be processed, and a credit will
            automatically be applied to your credit card or original method of payment. Partial refund may be
            credited if the item is returned due to inaccurate address, or if the packaging is not in its
            original packaging and unused.
          </p>
          <h3>Clearance items</h3>
          <p>Only regular priced items may be refunded. Clearance items cannot be returned or refunded.</p>
        </section>
        <section aria-labelledby="returns-shipping">
          <h2 id="returns-shipping">Shipping returns</h2>
          <p>
            To return your product, you should mail your product to: SPUSA, {SITE.address[0]}, {SITE.address[1]}.
            Please include order number on the box or on a note inside the box.
          </p>
          <p>
            You will be responsible for paying for your own shipping costs for returning your item. Shipping
            costs are non-refundable.
          </p>
        </section>
        <section aria-labelledby="returns-help">
          <h2 id="returns-help">Need help?</h2>
          <p>
            Contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> for questions related to refunds and
            returns.
          </p>
        </section>
      </article>
    </div>
  );
}
