import { motion, useReducedMotion } from "framer-motion";
import type { FaqItem } from "../../data/faqs";
import { IconMinus, IconPlus } from "../Icons";

type FAQAccordionItemProps = {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
};

export function FAQAccordionItem({ item, open, onToggle }: FAQAccordionItemProps) {
  const reduce = useReducedMotion();
  const panelId = `${item.id}-panel`;
  const buttonId = `${item.id}-button`;

  return (
    <div className={`faq-item${open ? " is-open" : ""}`}>
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{item.question}</span>
          {open ? <IconMinus /> : <IconPlus />}
        </button>
      </h3>
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div className="faq-answer">
          {item.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {item.review ? (
            <div className="faq-review">
              <p className="faq-review-label">Needs review</p>
              <p>{item.review.summary}</p>
              {item.review.sources.map((source) => (
                <div key={source.label}>
                  <h4>{source.label}</h4>
                  {source.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
