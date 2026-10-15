import { formatMoney } from "../../lib/format";
import { useCommerce } from "../../context/CommerceContext";
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

export function AccountPage() {
  const { profile } = useCommerce();
  const recent = orderService.list()[0];

  return (
    <AccountLayout path="/account" title="My Account">
      <section className="commerce-card" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading">
          Hello, {profile.firstName}
        </h2>
        <p>
          {profile.firstName} {profile.lastName}
        </p>
        <p>{profile.email}</p>
        <p className="sku">Username {profile.username}</p>
      </section>
      <section className="commerce-card" aria-labelledby="recent-order-heading">
        <h2 id="recent-order-heading">Recent orders</h2>
        {recent ? (
          <>
            <p>
              {recent.number} · {formatDate(recent.placedOn)} · {recent.status}
            </p>
            <p>{formatMoney(recent.subtotal)} subtotal</p>
            <a className="btn" href={`/account/orders/${recent.id}`}>
              View Details
            </a>
          </>
        ) : (
          <p>You have no orders yet.</p>
        )}
      </section>
    </AccountLayout>
  );
}
