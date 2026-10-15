import { catalogCategories } from "../../data/catalog/load";
import type { CatalogCategory } from "../../data/catalog/types";

export function CategoryLinks({ categories }: { categories: CatalogCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <ul className="catalog-children">
      {categories.map((category) => (
        <li key={category.id}>
          <a href={`/shop/${category.slug}`}>
            {category.name}
            <span className="catalog-child-count">{category.productIds.length}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CategoryTiles({ categories }: { categories: CatalogCategory[] }) {
  return (
    <ul className="catalog-tiles">
      {categories.map((category) => (
        <li key={category.id}>
          <a className="choice-card" href={`/shop/${category.slug}`}>
            <span className="choice-media">
              {category.image ? (
                <img src={category.image} alt="" width="320" height="240" loading="lazy" />
              ) : (
                <span className="catalog-tile-fallback" aria-hidden="true">
                  {category.name.slice(0, 1)}
                </span>
              )}
            </span>
            <span className="choice-copy">
              <span className="choice-title">{category.name}</span>
              <span className="catalog-tile-count">{category.productIds.length} parts</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function vehicleCategories(): CatalogCategory[] {
  return ["sidekick-tracker", "lwb-gypsyking"].flatMap((slug) => {
    const category = catalogCategories.find((item) => item.slug === slug);
    return category ? [category] : [];
  });
}
