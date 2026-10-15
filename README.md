# Suzuki Parts USA Homepage

A responsive React + TypeScript homepage for [Suzuki Parts USA](https://suzukipartsusa.com/), laid out from the redesign mockup and filled with catalog information from the live store.

## Run locally

```bash
npm install
npm run dev
```

The dev server opens at `http://localhost:5173/`.

```bash
npm run build
npm run preview
```

`npm run build` typechecks the project and writes a production bundle to `dist/`.

## What is wired to the live store

Search, category links, product pages, Add to Cart, the cart, and account all go to the existing WooCommerce site:

- Search: `https://suzukipartsusa.com/?s={query}&post_type=product&dgwt_wcas=1`
- Add to Cart: `https://suzukipartsusa.com/?add-to-cart={productId}`
- Cart: `https://suzukipartsusa.com/cart/`
- Account: `https://suzukipartsusa.com/my-account/`

There is no local cart. The header does not show an item count because this frontend cannot read the WooCommerce session.

## Catalog notes

Prices, SKUs, stock, and product URLs were taken from the live homepage. They can change in the store and should be refreshed before a production launch. The Samurai / SJ Series card opens the main shop, because the live catalog does not have a separate Samurai category. Sidekick / Tracker and Long Wheel Base / Gypsy King use their real category URLs.

About Us and Help / FAQ both open `https://suzukipartsusa.com/about-us/`, which is the live page for the company introduction and FAQ. No separate privacy, terms, or shipping-policy pages were found. Shipping answers are on that FAQ page. Returns are at `https://suzukipartsusa.com/contacts/refund_returns/`.

Vehicle photography is stored locally. See the photo credits in the footer for authors and licenses. Product and category photos come from the Suzuki Parts USA catalog.
