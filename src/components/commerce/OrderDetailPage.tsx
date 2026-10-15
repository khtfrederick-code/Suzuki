import { formatMoney } from "../../lib/format";
import { orderService } from "../../services/orders/demoOrders";
import { AccountLayout } from "./AccountLayout";

const placeholder = "/assets/catalog/image-unavailable.webp";

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const order = orderService.get(decodeURIComponent(orderId));

  return (
    <AccountLayout path="/account/orders" title="Order details">
      {!order ? (
        <div className="commerce-card empty-state">
          <h2>Order not found</h2>
          <p>That order is not on this account.</p>
          <a className="btn" href="/account/orders">
            Back to Orders
          </a>
        </div>
      ) : (
        <section className="commerce-card">
          <h2>{order.number}</h2>
          <p>{formatDate(order.placedOn)}</p>
          <p>Status: {order.status}</p>
          <ul className="summary-lines">
            {order.lines.map((line) => (
              <li key={line.productId}>
                <img src={line.image ?? placeholder} alt="" width="64" height="48" />
                <span>
                  <a href={`/product/${line.slug}`}>{line.name}</a>
                  {line.sku ? <span>SKU {line.sku}</span> : null}
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
              <dd>{formatMoney(order.subtotal)}</dd>
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
          <a className="btn btn-secondary" href="/account/orders">
            Back to Orders
          </a>
        </section>
      )}
    </AccountLayout>
  );
}
