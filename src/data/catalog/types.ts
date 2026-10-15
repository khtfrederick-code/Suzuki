export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  sku: string;
  price: number | null;
  regularPrice: number | null;
  onSale: boolean;
  inStock: boolean;
  images: string[];
  categoryIds: number[];
  search: string;
};

export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number;
  description: string;
  image: string | null;
  productIds: number[];
};

export type CatalogSort = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export type CatalogQuery = {
  q: string;
  sort: CatalogSort;
  stock: "" | "in" | "out";
  page: number;
};
