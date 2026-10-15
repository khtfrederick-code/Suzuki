import { formatMoney } from "../../lib/format";
import { orderService } from "../../services/orders/demoOrders";
import { AccountLayout } from "./AccountLayout";

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function OrdersPage() {
  const orders = orderService.list();

  return (
    <AccountLayout path="/account/orders" title="Orders">
      <section className="commerce-card">
        <h2>Order history</h2>
        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders</h3>
            <p>Orders you place will show up here.</p>
          </div>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id}>
                <div>
                  <strong>{order.number}</strong>
                  <p>{formatDate(order.placedOn)}</p>
                  <p>{order.status}</p>
                </div>
                <div>
                  <p>{formatMoney(order.subtotal)} subtotal</p>
                  <a href={`/account/orders/${order.id}`}>View Details</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AccountLayout>
  );
}
