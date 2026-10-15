import { CategoryPage } from "./CategoryPage";
import { ProductPage } from "./ProductPage";
import { ShopPage } from "./ShopPage";

export function CatalogRoutes({ path }: { path: string }) {
  if (path === "/shop") return <ShopPage />;
  if (path.startsWith("/product/")) {
    return <ProductPage slug={path.slice("/product/".length)} />;
  }
  if (path.startsWith("/shop/")) {
    return <CategoryPage slug={path.slice("/shop/".length)} />;
  }
  return null;
}
