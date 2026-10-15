import { footerColumns } from "../data/navigation";
import { SITE } from "../data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="/" aria-label="Suzuki Parts USA home">
            <img src="/assets/logo/suzuki-parts-usa-logo.png" alt="" width="544" height="121" />
          </a>
          <p>
            {SITE.address[0]}
            <br />
            {SITE.address[1]}
          </p>
          <p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
          <p>Text only: {SITE.textOnlyPhone}</p>
          <p>{SITE.hours}</p>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container footer-base">
        <p>© {new Date().getFullYear()} Suzuki Parts USA. All rights reserved.</p>
        <p>Product photos are from the Suzuki Parts USA catalog.</p>
      </div>
    </footer>
  );
}
