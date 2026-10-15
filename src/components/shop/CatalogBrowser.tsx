import { filterProducts, paginate, readCatalogQuery } from "../../data/catalog/query";
import type { CatalogProduct } from "../../data/catalog/types";
import { CatalogCard } from "./CatalogCard";
import { CatalogPagination, CatalogToolbar } from "./CatalogToolbar";

export function CatalogBrowser({
  pathname,
  products,
  heading,
  headingId,
}: {
  pathname: string;
  products: CatalogProduct[];
  heading?: string;
  headingId?: string;
}) {
  const query = readCatalogQuery(window.location.search);
  const matched = filterProducts(products, query);
  const page = paginate(matched, query.page);

  return (
    <div className="catalog-browser">
      {heading ? <h2 id={headingId}>{heading}</h2> : null}
      <CatalogToolbar pathname={pathname} query={query} total={matched.length} />
      {page.slice.length > 0 ? (
        <ul className="catalog-grid">
          {page.slice.map((product) => (
            <li key={product.id}>
              <CatalogCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="catalog-empty" role="status">
          No parts match this search. Try another name or SKU, or clear the filters.
        </p>
      )}
      <CatalogPagination pathname={pathname} query={query} page={page.page} pages={page.pages} />
    </div>
  );
}
