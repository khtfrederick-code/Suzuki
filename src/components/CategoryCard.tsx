import type { CategoryOption } from "../types/catalog";
import { IconChevron } from "./Icons";

type CategoryCardProps = {
  category: CategoryOption;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <a className="choice-card" href={category.href}>
      <span className="choice-media">
        <img src={category.image} alt="" width="320" height="240" loading="lazy" />
      </span>
      <span className="choice-copy">
        <span className="choice-title">{category.name}</span>
        <span className="sr-only">Open this category in the catalog</span>
      </span>
      <IconChevron />
      <span className="sr-only"> in the Suzuki Parts USA catalog</span>
    </a>
  );
}
