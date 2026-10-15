import type { ComponentType } from "react";
import { faqCategories } from "../../data/faqs";
import { IconBox, IconCard, IconChevron, IconShipping, IconTag } from "../Icons";

const icons: Record<string, ComponentType<{ className?: string }>> = {
  shipping: IconShipping,
  payment: IconCard,
  returns: IconBox,
  promotions: IconTag,
};

type FAQCategoryNavProps = {
  activeId: string;
  onSelect: (id: string) => void;
};

export function FAQCategoryNav({ activeId, onSelect }: FAQCategoryNavProps) {
  return (
    <nav className="faq-nav" aria-label="FAQ categories">
      <h2>FAQ Categories</h2>
      <ul>
        {faqCategories.map((category) => {
          const Icon = icons[category.id] ?? IconBox;
          const selected = category.id === activeId;
          return (
            <li key={category.id}>
              <button
                type="button"
                className={selected ? "is-active" : ""}
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(category.id)}
              >
                <Icon className="faq-nav-icon" />
                <span>{category.label}</span>
                <IconChevron className="faq-nav-chevron" />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
