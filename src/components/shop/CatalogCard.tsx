import { useState } from "react";
import { useCommerce } from "../../context/CommerceContext";
import type { CatalogProduct } from "../../data/catalog/types";
import { formatMoney } from "../../lib/format";

type CatalogCardProps = {
  product: CatalogProduct;
};

export function CatalogCard({ product }: CatalogCardProps) {
  const { addItem } = useCommerce();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const href = `/product/${product.slug}`;
  const image = product.images[0] ?? "/assets/catalog/image-unavailable.webp";
  const missingImage = image.endsWith("image-unavailable.webp");
  const canAdd = product.price !== null && product.inStock;
  const quantityId = `card-qty-${product.id}`;

  const onAdd = () => {
    if (product.price === null) {
      return;
    }
    setAdding(true);
    setAdded(false);
    void addItem({
      productId: product.id,
      variationId: null,
      attributes: {},
      quantity,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images[0] ?? null,
      unitPrice: product.price,
      regularPrice: product.regularPrice,
    }).then((result) => {
      setAdding(false);
      if (result.ok) {
        setAdded(true);
      }
    });
  };

  return (
    <article className="product-card catalog-card">
      <a className="product-media" href={href}>
        <img
          src={image}
          alt={missingImage ? "" : product.name}
          width="640"
          height="480"
          loading="lazy"
        />
      </a>
      <div className="product-body">
        <h3>
          <a href={href}>{product.name}</a>
        </h3>
        {product.sku ? <p className="sku">SKU {product.sku}</p> : <p className="sku">&nbsp;</p>}
        <p className="price-row">
          {product.price === null ? (
            <span className="price">Price unavailable</span>
          ) : (
            <span className="price">{formatMoney(product.price)}</span>
          )}
          {product.onSale && product.regularPrice !== null ? (
            <span className="compare">
              <span className="sr-only">Original price</span>
              <s>{formatMoney(product.regularPrice)}</s>
            </span>
          ) : null}
        </p>
        <p className={`stock${product.inStock ? " is-in" : " is-out"}`}>
          <span className="stock-dot" aria-hidden="true" />
          {product.inStock ? "In stock when imported" : "Out of stock when imported"}
        </p>
        <form
          className="card-purchase"
          onSubmit={(event) => {
            event.preventDefault();
            onAdd();
          }}
        >
          <div className="qty-field">
            <label htmlFor={quantityId}>Quantity</label>
            <input
              id={quantityId}
              inputMode="numeric"
              value={quantity}
              disabled={!canAdd}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isInteger(next) && next > 0 && next <= 99) {
                  setQuantity(next);
                  setAdded(false);
                }
              }}
            />
          </div>
          <button className="btn" type="submit" disabled={!canAdd || adding}>
            {adding ? "Adding…" : added ? "Added" : "Add to Cart"}
          </button>
        </form>
      </div>
    </article>
  );
}
