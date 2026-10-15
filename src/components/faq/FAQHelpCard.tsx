import { IconArrow, IconHeadset } from "../Icons";

export function FAQHelpCard() {
  return (
    <aside className="faq-help">
      <span className="faq-help-icon" aria-hidden="true">
        <IconHeadset />
      </span>
      <h2>Still Need Help?</h2>
      <p>Can’t find the answer you’re looking for? Contact our team.</p>
      <a className="btn" href="/contact">
        Contact Us <IconArrow />
      </a>
    </aside>
  );
}
