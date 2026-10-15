import { FormEvent, useState } from "react";
import { formatMoney } from "../../lib/format";
import { useCommerce } from "../../context/CommerceContext";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { usePageTitle } from "./usePageTitle";

const placeholder = "/assets/catalog/image-unavailable.webp";

export function CartPage() {
  usePageTitle("Shopping Cart | Suzuki Parts USA");
  const { cart, cartError, setQuantity, removeLine } = useCommerce();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const changeQuantity = (lineId: string, quantity: number) => {
    setPendingId(lineId);
    const result = setQuantity(lineId, quantity);
    setMessage(result.ok ? "" : result.message);
    window.setTimeout(() => setPendingId((current) => (current === lineId ? null : current)), 180);
  };

  const onCoupon = (event: FormEvent) => {
    event.preventDefault();
    if (!coupon.trim()) {
      setCouponMessage("Enter a coupon code.");
      return;
    }
    setCouponMessage("That coupon could not be applied.");
  };

  return (
    <div className="catalog-page">
      <div className="container commerce-wrap">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shopping Cart" }]} />
        <h1>Shopping Cart</h1>
        {cartError ? (
          <p className="commerce-alert" role="alert">
            {cartError}
          </p>
        ) : null}
        {message ? (
          <p className="commerce-alert" role="status">
            {message}
          </p>
        ) : null}
        {cart.lines.length === 0 ? (
          <div className="commerce-card empty-state">
            <h2>Your cart is empty</h2>
            <p>Add a part from the shop, then come back to check out.</p>
            <a className="btn" href="/shop">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="commerce-card">
              <ul className="cart-lines">
                {cart.lines.map((line) => {
                  const attributes = Object.entries(line.attributes);
                  return (
                    <li key={line.lineId} className="cart-line">
                      <img src={line.image ?? placeholder} alt="" width="96" height="72" />
                      <div>
                        <a className="cart-name" href={`/product/${line.slug}`}>
                          {line.name}
                        </a>
                        {line.sku ? <p className="sku">SKU {line.sku}</p> : null}
                        {line.variationId !== null ? <p className="sku">Variation {line.variationId}</p> : null}
                        {attributes.length > 0 ? (
                          <ul className="line-attributes">
                            {attributes.map(([name, value]) => (
                              <li key={name}>
                                {name}: {value}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <p className="line-unit">{formatMoney(line.unitPrice)} each</p>
                        <div className="qty-control">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${line.name}`}
                            onClick={() => changeQuantity(line.lineId, line.quantity - 1)}
                            disabled={line.quantity <= 1 || pendingId === line.lineId}
                          >
                            −
                          </button>
                          <label className="sr-only" htmlFor={`qty-${line.lineId}`}>
                            Quantity for {line.name}
                          </label>
                          <input
                            id={`qty-${line.lineId}`}
                            inputMode="numeric"
                            value={line.quantity}
                            onChange={(event) => {
                              const next = Number(event.target.value);
                              if (Number.isInteger(next)) {
                                changeQuantity(line.lineId, next);
                              }
                            }}
                          />
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${line.name}`}
                            onClick={() => changeQuantity(line.lineId, line.quantity + 1)}
                            disabled={pendingId === line.lineId}
                          >
                            +
                          </button>
                          {pendingId === line.lineId ? <span className="qty-status">Updating…</span> : null}
                        </div>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            removeLine(line.lineId);
                            setMessage(`${line.name} was removed.`);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <p className="line-total">
                        <span className="sr-only">Line subtotal</span>
                        {formatMoney(line.unitPrice * line.quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <form className="coupon-row" onSubmit={onCoupon}>
                <div className="field">
                  <label htmlFor="coupon-code">Coupon code</label>
                  <input
                    id="coupon-code"
                    value={coupon}
                    autoComplete="off"
                    onChange={(event) => {
                      setCoupon(event.target.value);
                      setCouponMessage("");
                    }}
                  />
                </div>
                <button className="btn btn-secondary" type="submit">
                  Apply
                </button>
              </form>
              {couponMessage ? (
                <p className="field-hint" role="status">
                  {couponMessage}
                </p>
              ) : null}
            </div>
            <aside className="commerce-card summary-card" aria-labelledby="cart-summary-title">
              <h2 id="cart-summary-title">Order summary</h2>
              <dl className="summary-rows">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(cart.subtotal)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>Pending calculation</dd>
                </div>
                <div>
                  <dt>Tax</dt>
                  <dd>Pending calculation</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>Pending final calculation</dd>
                </div>
              </dl>
              <a className="btn btn-block" href="/checkout">
                Proceed to Checkout
              </a>
              <a className="btn btn-secondary btn-block" href="/shop">
                Continue Shopping
              </a>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
