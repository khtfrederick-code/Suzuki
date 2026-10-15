import type { ReactNode } from "react";
import { useCommerce } from "../../context/CommerceContext";
import { Breadcrumbs } from "../shop/Breadcrumbs";
import { usePageTitle } from "./usePageTitle";

const links = [
  { href: "/account", label: "Overview", match: (path: string) => path === "/account" },
  { href: "/account/orders", label: "Orders", match: (path: string) => path.startsWith("/account/orders") },
  { href: "/account/addresses", label: "Addresses", match: (path: string) => path === "/account/addresses" },
  { href: "/account/details", label: "Account details", match: (path: string) => path === "/account/details" },
];

export function AccountLayout({ path, title, children }: { path: string; title: string; children: ReactNode }) {
  usePageTitle(`${title} | Suzuki Parts USA`);
  const { session, signOut } = useCommerce();

  if (!session) {
    return (
      <div className="catalog-page">
        <div className="container commerce-wrap">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
          <h1>My Account</h1>
          <div className="commerce-card empty-state">
            <h2>You are signed out</h2>
            <p>Sign in to view your account.</p>
            <a className="btn" href="/login">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="container commerce-wrap">
        <Breadcrumbs
          items={
            title === "My Account"
              ? [{ label: "Home", href: "/" }, { label: "My Account" }]
              : [{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: title }]
          }
        />
        <h1>{title}</h1>
        <div className="account-layout">
          <nav className="account-nav" aria-label="Account">
            {links.map((link) => (
              <a key={link.href} href={link.href} aria-current={link.match(path) ? "page" : undefined}>
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                signOut();
                window.location.assign("/login");
              }}
            >
              Sign Out
            </button>
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
