import type { Product } from "../types/catalog";
import { formatMoney } from "../lib/format";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const onSale = typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const inStock = product.stock === "in-stock";

  return (
    <article className="product-card" data-card>
      <a className="product-media" href={product.url}>
        <img src={product.image} alt={product.imageAlt} width="640" height="480" loading="lazy" />
      </a>
      <div className="product-body">
        <h3>
          <a href={product.url}>{product.name}</a>
        </h3>
        <p className="compat">{product.compatibility}</p>
        <p className="sku">SKU {product.sku}</p>
        <p className="price-row">
          <span className="price">{formatMoney(product.price)}</span>
          {onSale && product.compareAtPrice ? (
            <span className="compare">
              <span className="sr-only">Original price</span>
              <s>{formatMoney(product.compareAtPrice)}</s>
            </span>
          ) : null}
        </p>
        <p className={`stock${inStock ? " is-in" : " is-out"}`}>
          <span className="stock-dot" aria-hidden="true" />
          {inStock ? "In stock when imported" : "Out of stock when imported"}
        </p>
        <a className="btn btn-block" href={product.url}>
          View part
        </a>
      </div>
    </article>
  );
}
