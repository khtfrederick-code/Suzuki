import { useEffect, useState } from "react";
import { useCommerce } from "../../context/CommerceContext";
import { categoryById, productBySlug } from "../../data/catalog/load";
import { categoryTrail, primaryCategory, relatedProducts } from "../../data/catalog/query";
import { formatMoney } from "../../lib/format";
import { Breadcrumbs } from "./Breadcrumbs";
import { CatalogCard } from "./CatalogCard";
import { ProductGallery } from "./ProductGallery";

type DescriptionFile = {
  description?: string;
  shortDescription?: string;
};

export function ProductPage({ slug }: { slug: string }) {
  const product = productBySlug.get(decodeURIComponent(slug));
  const { addItem } = useCommerce();
  const [description, setDescription] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (!product) {
      document.title = "Part not found | Suzuki Parts USA";
      return;
    }
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") ?? "";
    document.title = `${product.name} | Suzuki Parts USA`;
    meta?.setAttribute("content", `${product.name}. SKU ${product.sku}.`);
    return () => {
      document.title = previousTitle;
      meta?.setAttribute("content", previousDescription);
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    let cancel = false;
    setDescription(null);
    fetch(`/catalog/descriptions/${product.id}.json`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: DescriptionFile | null) => {
        if (!cancel) setDescription(data?.description || data?.shortDescription || "");
      })
      .catch(() => {
        if (!cancel) setDescription("");
      });
    return () => {
      cancel = true;
    };
  }, [product]);

  if (!product) {
    return (
      <div className="catalog-page">
        <div className="container catalog-missing">
          <h1>Part not found</h1>
          <p>That part is not in the imported catalog.</p>
          <a className="btn" href="/shop">
            Back to Shop Parts
          </a>
        </div>
      </div>
    );
  }

  const primary = primaryCategory(product);
  const trail = primary ? categoryTrail(primary) : [];
  const categories = product.categoryIds.flatMap((id) => {
    const category = categoryById.get(id);
    return category ? [category] : [];
  });
  const related = relatedProducts(product);
  const paragraphs = (description ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className="catalog-page">
      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop Parts", href: "/shop" },
            ...trail.map((item) => ({ label: item.name, href: `/shop/${item.slug}` })),
            { label: product.name },
          ]}
        />
        <article className="product-detail">
          <ProductGallery images={product.images} name={product.name} />
          <div className="product-detail-copy">
            <h1>{product.name}</h1>
            {product.sku ? <p className="sku">SKU {product.sku}</p> : null}
            <p className="price-row product-detail-price">
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
            {product.price === null ? (
              <p className="commerce-alert">This part has no imported price, so it cannot be added to the cart.</p>
            ) : null}
            {product.price !== null && !product.inStock ? (
              <p className="commerce-alert">This part was out of stock when the catalog was imported, so it cannot be added.</p>
            ) : null}
            {product.price !== null && product.inStock ? (
              <form
                className="product-purchase"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (product.price === null) {
                    return;
                  }
                  setAdding(true);
                  setAdded(false);
                  setAddError("");
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
                    if (!result.ok) {
                      setAddError(result.message);
                      return;
                    }
                    setAdded(true);
                  });
                }}
              >
                <div className="qty-field">
                  <label htmlFor="product-qty">Quantity</label>
                  <input
                    id="product-qty"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isInteger(next) && next > 0 && next <= 99) {
                        setQuantity(next);
                      }
                    }}
                  />
                </div>
                <button className="btn" type="submit" disabled={adding}>
                  {adding ? "Adding…" : "Add to Cart"}
                </button>
                {added ? (
                  <p className="product-feedback" role="status">
                    Added to cart. <a href="/cart">View cart</a>
                  </p>
                ) : null}
                {addError ? (
                  <p className="product-feedback commerce-alert" role="alert">
                    {addError}
                  </p>
                ) : null}
              </form>
            ) : null}
            {categories.length > 0 ? (
              <p className="product-categories">
                {categories.map((category, index) => (
                  <span key={category.id}>
                    {index > 0 ? ", " : ""}
                    <a href={`/shop/${category.slug}`}>{category.name}</a>
                  </span>
                ))}
              </p>
            ) : null}
            <div className="product-description">
              {description === null ? <p>Loading description…</p> : null}
              {description === "" ? <p>No description was published for this part.</p> : null}
              {paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
        {related.length > 0 ? (
          <section className="catalog-related" aria-labelledby="related-title">
            <h2 id="related-title">Related parts</h2>
            <ul className="catalog-grid">
              {related.map((item) => (
                <li key={item.id}>
                  <CatalogCard product={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
