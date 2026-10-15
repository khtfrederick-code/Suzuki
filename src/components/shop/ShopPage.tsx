import { useEffect } from "react";
import { catalogImportedAt, topCategories } from "../../data/catalog/load";
import { allCatalogProducts } from "../../data/catalog/query";
import { CatalogBrowser } from "./CatalogBrowser";
import { CategoryTiles, vehicleCategories } from "./CategoryTiles";

const importedLabel = new Date(catalogImportedAt).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function ShopPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = "Shop Suzuki Parts | Suzuki Parts USA";
    meta?.setAttribute(
      "content",
      "Browse Suzuki replacement parts by category, including Samurai, Sidekick, Tracker, and Long Wheel Base / Gypsy King parts.",
    );
    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, []);

  const vehicles = vehicleCategories();

  return (
    <div className="catalog-page">
      <header className="catalog-intro">
        <div className="container">
          <p className="eyebrow-dash">Shop Parts</p>
          <h1>Shop Suzuki Parts</h1>
          <p>
            Replacement parts for Suzuki vehicles, organized in the same categories as the Suzuki Parts USA
            catalog. Samurai parts are listed across those categories. Sidekick / Tracker and Long Wheel Base /
            Gypsy King also have their own categories.
          </p>
          <p className="catalog-note">Prices and stock were imported on {importedLabel} and are not a live inventory.</p>
        </div>
      </header>

      {vehicles.length > 0 ? (
        <section className="catalog-section" aria-labelledby="shop-vehicles-title">
          <div className="container">
            <h2 id="shop-vehicles-title">Shop by Vehicle</h2>
            <CategoryTiles categories={vehicles} />
          </div>
        </section>
      ) : null}

      <section className="catalog-section" aria-labelledby="shop-categories-title">
        <div className="container">
          <h2 id="shop-categories-title">Browse Parts Categories</h2>
          <CategoryTiles categories={topCategories} />
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="shop-parts-title">
        <div className="container">
          <CatalogBrowser pathname="/shop" products={allCatalogProducts} heading="All Parts" headingId="shop-parts-title" />
        </div>
      </section>
    </div>
  );
}
