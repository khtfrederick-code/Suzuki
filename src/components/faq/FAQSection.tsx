import type { FaqCategory } from "../../data/faqs";
import { FAQAccordionItem } from "./FAQAccordionItem";

type FAQSectionProps = {
  category: FaqCategory;
  openIds: string[];
  onToggle: (id: string) => void;
};

export function FAQSection({ category, openIds, onToggle }: FAQSectionProps) {
  return (
    <section className="faq-section" id={category.id} aria-labelledby={`${category.id}-title`}>
      <p className="eyebrow-dash">{category.eyebrow}</p>
      <h2 id={`${category.id}-title`}>{category.title}</h2>
      <p className="faq-section-lead">{category.description}</p>
      <div className="faq-list">
        {category.items.map((item) => (
          <FAQAccordionItem
            key={item.id}
            item={item}
            open={openIds.includes(item.id)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
