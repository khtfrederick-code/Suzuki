export type StockStatus = "in-stock" | "out-of-stock";

export type Product = {
  id: string;
  sku: string;
  name: string;
  compatibility: string;
  note?: string;
  price: number;
  compareAtPrice?: number;
  stock: StockStatus;
  image: string;
  imageAlt: string;
  url: string;
};

export type VehicleOption = {
  id: string;
  name: string;
  detail: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavItem = NavLink & {
  children?: NavLink[];
};
