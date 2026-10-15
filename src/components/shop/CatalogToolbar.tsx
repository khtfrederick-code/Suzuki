import type { CatalogQuery } from "../../data/catalog/types";
import { catalogHref } from "../../data/catalog/query";

type CatalogToolbarProps = {
  pathname: string;
  query: CatalogQuery;
  total: number;
};

export function CatalogToolbar({ pathname, query, total }: CatalogToolbarProps) {
  return (
    <form className="catalog-toolbar" method="get" action={pathname}>
      <label className="catalog-search">
        <span className="sr-only">Search these parts</span>
        <input name="q" type="search" defaultValue={query.q} placeholder="Search name or SKU" />
      </label>
      <label>
        <span>Sort</span>
        <select name="sort" defaultValue={query.sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
        </select>
      </label>
      <label>
        <span>Availability</span>
        <select name="stock" defaultValue={query.stock} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
          <option value="">Any</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
      </label>
      <button className="btn" type="submit">
        Apply
      </button>
      <p className="catalog-count">
        {total} {total === 1 ? "part" : "parts"}
      </p>
    </form>
  );
}

export function CatalogPagination({
  pathname,
  query,
  page,
  pages,
}: {
  pathname: string;
  query: CatalogQuery;
  page: number;
  pages: number;
}) {
  if (pages < 2) return null;
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pages, windowStart + 4);
  const numbers = [];
  for (let number = windowStart; number <= windowEnd; number += 1) numbers.push(number);

  return (
    <nav className="catalog-pages" aria-label="Pagination">
      {windowStart > 1 ? <a href={catalogHref(pathname, query, 1)}>First</a> : null}
      {page === 1 ? (
        <span aria-disabled="true">Previous</span>
      ) : (
        <a href={catalogHref(pathname, query, page - 1)}>Previous</a>
      )}
      {numbers.map((number) => (
        <a key={number} href={catalogHref(pathname, query, number)} aria-current={number === page ? "page" : undefined}>
          {number}
        </a>
      ))}
      {page === pages ? (
        <span aria-disabled="true">Next</span>
      ) : (
        <a href={catalogHref(pathname, query, page + 1)}>Next</a>
      )}
      {windowEnd < pages ? <a href={catalogHref(pathname, query, pages)}>Last</a> : null}
    </nav>
  );
}
