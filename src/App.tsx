import { lazy, Suspense, useEffect } from "react";
import { AboutPage } from "./components/AboutPage";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { ContactPage } from "./components/ContactPage";
import { FAQPage } from "./components/faq/FAQPage";
import { Footer } from "./components/Footer";
import { GalleryPage } from "./components/GalleryPage";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { ReturnsPage } from "./components/ReturnsPage";

const CatalogRoutes = lazy(() =>
  import("./components/shop/CatalogRoutes").then((module) => ({ default: module.CatalogRoutes })),
);

const CommerceRoutes = lazy(() =>
  import("./components/commerce/CommerceRoutes").then((module) => ({ default: module.CommerceRoutes })),
);

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

function isCatalogPath(path: string) {
  return path === "/shop" || path.startsWith("/shop/") || path.startsWith("/product/");
}

function isCommercePath(path: string) {
  return (
    path === "/cart" ||
    path === "/checkout" ||
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/account" ||
    path.startsWith("/account/")
  );
}

export function App() {
  const path = currentPath();

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) {
      return;
    }
    const scroll = () => document.getElementById(id)?.scrollIntoView();
    scroll();
    const timer = window.setTimeout(scroll, 50);
    return () => window.clearTimeout(timer);
  }, [path]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main">
        {isCatalogPath(path) ? (
          <Suspense fallback={<p className="container catalog-loading">Loading parts…</p>}>
            <CatalogRoutes path={path} />
          </Suspense>
        ) : isCommercePath(path) ? (
          <Suspense fallback={<p className="container catalog-loading">Loading…</p>}>
            <CommerceRoutes path={path} />
          </Suspense>
        ) : path === "/contact" ? (
          <ContactPage />
        ) : path === "/faq" ? (
          <FAQPage />
        ) : path === "/about" ? (
          <AboutPage />
        ) : path === "/gallery" ? (
          <GalleryPage />
        ) : path === "/returns" ? (
          <ReturnsPage />
        ) : (
          <HomePage />
        )}
      </main>
      <Footer />
    </>
  );
}
