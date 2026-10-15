import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCommerce } from "../context/CommerceContext";
import { mainNav, shopGroups } from "../data/navigation";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { IconCart, IconChevron, IconClose, IconMenu, IconSearch, IconUser } from "./Icons";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const [stuck, setStuck] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const shopMenuId = useId();
  const shopCloseTimer = useRef<number>(0);
  const reduce = useReducedMotion();
  const { cart, session } = useCommerce();
  useFocusTrap(menuOpen, menuRef);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!shopOpen) {
      return;
    }
    const placeMenu = () => {
      const nav = shopRef.current;
      const menu = shopMenuRef.current;
      if (!nav || !menu) {
        return;
      }
      const rect = nav.getBoundingClientRect();
      const width = menu.offsetWidth;
      const center = rect.left + rect.width / 2;
      const left = Math.min(Math.max(center, width / 2 + 16), window.innerWidth - width / 2 - 16);
      menu.style.top = `${rect.bottom}px`;
      menu.style.left = `${left}px`;
    };
    placeMenu();
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, { passive: true });
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu);
    };
  }, [shopOpen]);

  useEffect(() => {
    if (!shopOpen) {
      return;
    }
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!shopRef.current?.contains(target) && !shopMenuRef.current?.contains(target)) {
        setShopOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [shopOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const currentPage = (href: string) => {
    if (href === "/shop" && (path === "/shop" || path.startsWith("/shop/") || path.startsWith("/product/"))) {
      return "page" as const;
    }
    return href === path ? ("page" as const) : undefined;
  };

  const closeSearch = () => {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  };
  const showShop = () => {
    window.clearTimeout(shopCloseTimer.current);
    setShopOpen(true);
  };
  const hideShop = () => {
    window.clearTimeout(shopCloseTimer.current);
    shopCloseTimer.current = window.setTimeout(() => setShopOpen(false), 160);
  };

  const shopMenu = (
    <div
      id={shopMenuId}
      ref={shopMenuRef}
      className={`shop-menu${shopOpen ? " is-open" : ""}`}
      onMouseEnter={showShop}
      onMouseLeave={hideShop}
    >
      <ul className="shop-groups">
        {shopGroups.map((group) => (
          <li key={group.href}>
            <a href={group.href}>{group.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <header className={`site-header${stuck ? " is-stuck" : ""}`}>
        <div className="container header-bar">
          <a className="logo-link" href="/" aria-label="Suzuki Parts USA home">
            <img src="/assets/logo/suzuki-parts-usa-logo.png" alt="Suzuki Parts USA" width="544" height="121" />
          </a>

          <nav className="desktop-nav" aria-label="Primary">
            <div
              className={`shop-nav${shopOpen ? " is-open" : ""}`}
              ref={shopRef}
              onMouseEnter={showShop}
              onMouseLeave={hideShop}
            >
              <a href="/shop" aria-current={currentPage("/shop")}>
                Shop Parts
              </a>
              <button
                type="button"
                className="shop-toggle"
                aria-expanded={shopOpen}
                aria-controls={shopMenuId}
                onClick={() => setShopOpen((open) => !open)}
              >
                <span className="sr-only">Shop categories</span>
                <IconChevron />
              </button>
            </div>
            {mainNav.slice(1).map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-current={currentPage(item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-tools">
            <button
              ref={searchButtonRef}
              type="button"
              className="icon-button"
              aria-label="Search parts"
              aria-expanded={searchOpen}
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <IconSearch />
            </button>
            <a
              className="icon-button account-link"
              href={session ? "/account" : "/login"}
              aria-label={session ? "My account" : "Sign in"}
            >
              <IconUser />
            </a>
            <a className="icon-button cart-link" href="/cart" aria-label={`Cart, ${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`}>
              <IconCart />
              {cart.itemCount > 0 ? <span className="cart-count">{cart.itemCount}</span> : null}
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              className="icon-button menu-button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen(true);
              }}
            >
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="mobile-scrim"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            onMouseDown={() => {
              setMenuOpen(false);
              menuButtonRef.current?.focus();
            }}
          >
            <motion.div
              ref={menuRef}
              className="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduce ? undefined : { x: "100%" }}
              transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mobile-menu-head">
                <strong>Menu</strong>
                <button
                  ref={menuCloseRef}
                  type="button"
                  className="icon-button"
                  aria-label="Close menu"
                  onClick={() => {
                    setMenuOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                >
                  <IconClose />
                </button>
              </div>
              <nav aria-label="Mobile">
                <button
                  type="button"
                  className="mobile-shop-button"
                  aria-expanded={mobileShopOpen}
                  onClick={() => setMobileShopOpen((open) => !open)}
                >
                  Shop Parts
                  <IconChevron />
                </button>
                {mobileShopOpen ? (
                  <ul className="mobile-shop-list">
                    {shopGroups.map((group) => (
                      <li key={group.href}>
                        <a href={group.href}>{group.label}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {mainNav.slice(1).map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-current={currentPage(item.href)}
                  >
                    {item.label}
                  </a>
                ))}
                <a href={session ? "/account" : "/login"}>{session ? "My Account" : "Sign In"}</a>
                <a href="/cart">Cart{cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}</a>
              </nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      {createPortal(shopMenu, document.body)}
    </>
  );
}
