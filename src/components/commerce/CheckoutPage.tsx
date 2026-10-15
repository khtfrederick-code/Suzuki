import { FormEvent, useState } from "react";
import { useCommerce } from "../../context/CommerceContext";
import { formatMoney } from "../../lib/format";
import { checkoutService } from "../../services/checkout/demoCheckout";
import { emptyAddress } from "../../services/customer/demoCustomer";
import { previewDelay } from "../../services/storage";
import type { AddressDraft, FieldErrors } from "../../types/commerce";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { AddressFields } from "./AddressFields";
import { usePageTitle } from "./usePageTitle";

const placeholder = "/assets/catalog/image-unavailable.webp";

export function CheckoutPage() {
  usePageTitle("Checkout | Suzuki Parts USA");
  const { cart, session, profile, addresses } = useCommerce();
  const [email, setEmail] = useState(session ? profile.email : "");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState<AddressDraft>(session && addresses.shipping ? addresses.shipping : emptyAddress());
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<AddressDraft>(session && addresses.billing ? addresses.billing : emptyAddress());
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const methods = checkoutService.shippingMethods();
  const payments = checkoutService.paymentMethods();

  const onReview = async (event: FormEvent) => {
    event.preventDefault();
    setReviewing(true);
    await previewDelay(120);
    const nextErrors = checkoutService.validate({
      email,
      phone,
      shipping,
      billingSameAsShipping: billingSame,
      billing,
      shippingMethodId,
      paymentMethodId,
    });
    setErrors(nextErrors);
    setReviewing(false);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("");
      return;
    }
    setStatus("These details are ready to review.");
  };

  if (cart.lines.length === 0) {
    return (
      <div className="catalog-page">
        <div className="container commerce-wrap">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
          <h1>Checkout</h1>
          <div className="commerce-card empty-state">
            <h2>Your cart is empty</h2>
            <p>Add a part before checkout.</p>
            <a className="btn" href="/shop">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="container commerce-wrap">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1>Checkout</h1>
        <form className="checkout-layout" onSubmit={onReview} noValidate>
          <div>
            {Object.keys(errors).length > 0 ? (
              <p className="commerce-alert" role="alert">
                Check the highlighted fields before continuing.
              </p>
            ) : null}
            {status ? (
              <p className="commerce-status" role="status">
                {status}
              </p>
            ) : null}
            <section className="commerce-card" aria-labelledby="contact-heading">
              <h2 id="contact-heading">Contact</h2>
              <div className="field">
                <label htmlFor="checkout-email">Email address</label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "checkout-email-error" : undefined}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {errors.email ? (
                  <p className="field-error" id="checkout-email-error">
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="checkout-phone">Phone (optional)</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
                  onChange={(event) => setPhone(event.target.value)}
                />
                {errors.phone ? (
                  <p className="field-error" id="checkout-phone-error">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="commerce-card" aria-labelledby="shipping-address-heading">
              <h2 id="shipping-address-heading">Shipping address</h2>
              {session && addresses.shipping ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShipping(addresses.shipping ?? emptyAddress())}
                >
                  Use saved address
                </button>
              ) : null}
              <AddressFields idPrefix="ship" errorPrefix="shipping" value={shipping} errors={errors} onChange={setShipping} />
            </section>

            <section className="commerce-card" aria-labelledby="billing-heading">
              <h2 id="billing-heading">Billing address</h2>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={billingSame}
                  onChange={(event) => setBillingSame(event.target.checked)}
                />
                <span>Billing address is the same as shipping</span>
              </label>
              {billingSame ? null : (
                <AddressFields idPrefix="bill" errorPrefix="billing" value={billing} errors={errors} onChange={setBilling} />
              )}
            </section>

            <section className="commerce-card" aria-labelledby="shipping-method-heading">
              <h2 id="shipping-method-heading">Shipping method</h2>
              <p className="field-hint">
                Suzuki Parts USA ships with UPS, USPS, and DHL. UPS is the recommended carrier. Free-shipping options,
                where the store marks them, can take weeks. Rates are calculated from the destination. Orders are often
                shipped by the next business day and may ship within 3 business days.
              </p>
              <div className="choice-list" role="radiogroup" aria-describedby={errors.shippingMethodId ? "ship-method-error" : undefined}>
                {methods.map((method) => (
                  <label key={method.id} className="choice-option">
                    <input
                      type="radio"
                      name="shipping-method"
                      value={method.id}
                      checked={shippingMethodId === method.id}
                      onChange={() => setShippingMethodId(method.id)}
                    />
                    <span>
                      <strong>{method.label}</strong>
                      <span className="choice-pending">Rate pending</span>
                      <span>{method.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.shippingMethodId ? (
                <p className="field-error" id="ship-method-error">
                  {errors.shippingMethodId}
                </p>
              ) : null}
            </section>

            <section className="commerce-card" aria-labelledby="payment-heading">
              <h2 id="payment-heading">Payment</h2>
              <p className="field-hint">Major credit cards are accepted through PayPal. A PayPal account is not required.</p>
              <div className="choice-list" role="radiogroup" aria-describedby={errors.paymentMethodId ? "payment-error" : undefined}>
                {payments.map((method) => (
                  <label key={method.id} className="choice-option">
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={paymentMethodId === method.id}
                      onChange={() => setPaymentMethodId(method.id)}
                    />
                    <span>
                      <strong>{method.label}</strong>
                      <span>{method.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.paymentMethodId ? (
                <p className="field-error" id="payment-error">
                  {errors.paymentMethodId}
                </p>
              ) : null}
              <p className="field-hint">
                The FAQ and the Refund and Returns page do not agree on the return window (14 days versus 30 days).
                Read the <a href="/returns">Refund and Returns page</a> for the formal policy text. This checkout does
                not choose between those statements.
              </p>
            </section>

            <div className="checkout-actions">
              <a className="btn btn-secondary" href="/cart">
                Return to Cart
              </a>
              <button className="btn" type="submit" disabled={reviewing}>
                {reviewing ? "Checking…" : "Review details"}
              </button>
              <button className="btn" type="button" disabled>
                Place Order
              </button>
            </div>
          </div>

          <aside className="commerce-card summary-card" aria-labelledby="checkout-summary-title">
            <h2 id="checkout-summary-title">Order summary</h2>
            <ul className="summary-lines">
              {cart.lines.map((line) => (
                <li key={line.lineId}>
                  <img src={line.image ?? placeholder} alt="" width="64" height="48" />
                  <span>
                    <strong>{line.name}</strong>
                    {line.variationId !== null ? <span>Variation {line.variationId}</span> : null}
                    <span>Qty {line.quantity}</span>
                  </span>
                  <span>{formatMoney(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
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
            <p className="field-hint">
              Kentucky’s published sales-tax note is 6% for orders shipped within Kentucky. Other destinations may also
              be taxed.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
