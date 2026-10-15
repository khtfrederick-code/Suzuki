import categoryFile from "./categories.json";
import productFile from "./products.json";
import type { CatalogCategory, CatalogProduct } from "./types";

export const catalogImportedAt = productFile.importedAt;
export const catalogCategories = categoryFile.categories as CatalogCategory[];
export const catalogProducts = productFile.products as CatalogProduct[];

export const categoryById = new Map(catalogCategories.map((category) => [category.id, category]));
export const categoryBySlug = new Map(catalogCategories.map((category) => [category.slug, category]));
export const productById = new Map(catalogProducts.map((product) => [product.id, product]));
export const productBySlug = new Map(catalogProducts.map((product) => [product.slug, product]));

export const topCategories = catalogCategories
  .filter((category) => category.parentId === 0)
  .sort((a, b) => a.name.localeCompare(b.name));
