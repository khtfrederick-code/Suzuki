import {
  catalogProducts,
  categoryById,
  categoryBySlug,
  productById,
} from "./load";
import type { CatalogCategory, CatalogProduct, CatalogQuery, CatalogSort } from "./types";

export const PAGE_SIZE = 24;

const sorts = new Set<CatalogSort>(["name-asc", "name-desc", "price-asc", "price-desc"]);

export function readCatalogQuery(search: string): CatalogQuery {
  const params = new URLSearchParams(search);
  const sort = params.get("sort");
  const stock = params.get("stock");
  const page = Number(params.get("page") ?? "1");
  return {
    q: (params.get("q") ?? "").trim(),
    sort: sort && sorts.has(sort as CatalogSort) ? (sort as CatalogSort) : "name-asc",
    stock: stock === "in" || stock === "out" ? stock : "",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function catalogHref(pathname: string, query: CatalogQuery, page = query.page): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort !== "name-asc") params.set("sort", query.sort);
  if (query.stock) params.set("stock", query.stock);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `${pathname}?${value}` : pathname;
}

export function childCategories(categoryId: number): CatalogCategory[] {
  return catalogCategories()
    .filter((category) => category.parentId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function catalogCategories(): CatalogCategory[] {
  return [...categoryById.values()];
}

export function categoryTrail(category: CatalogCategory): CatalogCategory[] {
  const trail: CatalogCategory[] = [];
  let current: CatalogCategory | undefined = category;
  const seen = new Set<number>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    trail.unshift(current);
    current = current.parentId ? categoryById.get(current.parentId) : undefined;
  }
  return trail;
}

export function productsInCategory(category: CatalogCategory): CatalogProduct[] {
  return category.productIds.flatMap((id) => {
    const product = productById.get(id);
    return product ? [product] : [];
  });
}

export function filterProducts(products: CatalogProduct[], query: CatalogQuery): CatalogProduct[] {
  const needle = query.q.toLowerCase();
  const matched = products.filter((product) => {
    if (needle && !product.search.includes(needle)) return false;
    if (query.stock === "in" && !product.inStock) return false;
    if (query.stock === "out" && product.inStock) return false;
    return true;
  });
  const sorted = [...matched].sort((a, b) => compareProducts(a, b, query.sort));
  return sorted;
}

function compareProducts(a: CatalogProduct, b: CatalogProduct, sort: CatalogSort): number {
  if (sort === "name-desc") return b.name.localeCompare(a.name);
  if (sort === "price-asc" || sort === "price-desc") {
    const aPrice = a.price ?? Number.POSITIVE_INFINITY;
    const bPrice = b.price ?? Number.POSITIVE_INFINITY;
    const diff = sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
    if (diff !== 0) return diff;
  }
  return a.name.localeCompare(b.name);
}

export function paginate<T>(items: T[], page: number): { page: number; pages: number; slice: T[] } {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(Math.max(page, 1), pages);
  const start = (current - 1) * PAGE_SIZE;
  return { page: current, pages, slice: items.slice(start, start + PAGE_SIZE) };
}

export function relatedProducts(product: CatalogProduct, limit = 4): CatalogProduct[] {
  const categories = product.categoryIds
    .map((id) => categoryById.get(id))
    .filter((category): category is CatalogCategory => Boolean(category));
  const narrowest = [...categories].sort((a, b) => a.productIds.length - b.productIds.length)[0];
  if (!narrowest) return [];
  return productsInCategory(narrowest)
    .filter((item) => item.id !== product.id)
    .slice(0, limit);
}

export function primaryCategory(product: CatalogProduct): CatalogCategory | undefined {
  const categories = product.categoryIds
    .map((id) => categoryById.get(id))
    .filter((category): category is CatalogCategory => Boolean(category));
  return [...categories].sort((a, b) => a.productIds.length - b.productIds.length)[0];
}

export function findCategory(slug: string): CatalogCategory | undefined {
  return categoryBySlug.get(slug);
}

export const allCatalogProducts = catalogProducts;
