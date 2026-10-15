import { useEffect } from "react";
import { catalogImportedAt } from "../../data/catalog/load";
import {
  categoryTrail,
  childCategories,
  filterProducts,
  findCategory,
  productsInCategory,
  readCatalogQuery,
} from "../../data/catalog/query";
import { Breadcrumbs } from "./Breadcrumbs";
import { CatalogBrowser } from "./CatalogBrowser";
import { CategoryLinks } from "./CategoryTiles";

export function CategoryPage({ slug }: { slug: string }) {
  const category = slug.includes("/") ? undefined : findCategory(decodeURIComponent(slug));

  useEffect(() => {
    if (!category) {
      document.title = "Category not found | Suzuki Parts USA";
      return;
    }
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = `${category.name} | Suzuki Parts USA`;
    meta?.setAttribute(
      "content",
      category.description || `${category.name} from the Suzuki Parts USA catalog.`,
    );
    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, [category]);

  if (!category) {
    return (
      <div className="catalog-page">
        <div className="container catalog-missing">
          <h1>Category not found</h1>
          <p>That category is not in the imported catalog.</p>
          <a className="btn" href="/shop">
            Back to Shop Parts
          </a>
        </div>
      </div>
    );
  }

  const children = childCategories(category.id);
  const products = productsInCategory(category);
  const query = readCatalogQuery(window.location.search);
  const total = filterProducts(products, query).length;
  const importedLabel = new Date(catalogImportedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const trail = categoryTrail(category);

  return (
    <div className="catalog-page">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop Parts", href: "/shop" },
            ...trail.map((item) => ({ label: item.name, href: `/shop/${item.slug}` })),
          ]}
        />
        <header className="catalog-intro catalog-intro-flat">
          <h1>{category.name}</h1>
          {category.description ? <p>{category.description}</p> : null}
          <p className="catalog-note">
            {total} {total === 1 ? "part" : "parts"} in this category. Prices and stock were imported on{" "}
            {importedLabel}.
          </p>
        </header>
        {children.length > 0 ? (
          <div className="catalog-subcats">
            <h2>Subcategories</h2>
            <CategoryLinks categories={children} />
          </div>
        ) : null}
        <CatalogBrowser pathname={`/shop/${category.slug}`} products={products} />
      </div>
    </div>
  );
}
