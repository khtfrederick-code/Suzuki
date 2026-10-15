# Suzuki Parts USA commerce audit

Audit date: October 15, 2026. Source: public pages and the public WooCommerce Store API on https://suzukipartsusa.com/. No customer account was used. No item was added to the live cart.

## Verified existing features

- Empty cart page at `/cart/` with the heading “Shopping Cart” and the text “Your cart is currently empty.”
- Empty `/checkout/` redirects to `/cart/`.
- Logged-out account page at `/my-account/` with Login and Register on the same page.
- Login fields: username or email address, password, Remember me, Log in, and “Lost your password?”
- Registration fields on the public form: email address and password only.
- Lost-password page at `/my-account/lost-password/` with username or email and a “Reset password” button.
- Product pages expose a quantity field and add-to-cart control. The imported catalog has 1,219 simple products and no variations.
- Public cart payload includes a `coupons` array, so the store API can represent coupons. The empty cart HTML did not show a coupon field.
- Public cart payload lists payment method ids `ppcp-card-button-gateway` and `woocommerce_payments`.
- Shipping and billing address objects on the cart API include first name, last name, company, address lines, city, state, postcode, country, and phone. Billing also includes email.

## Original customer-facing URLs

| Page | URL |
| --- | --- |
| Cart | https://suzukipartsusa.com/cart/ |
| Checkout | https://suzukipartsusa.com/checkout/ (redirects to cart while the cart is empty) |
| Account login and registration | https://suzukipartsusa.com/my-account/ |
| Lost password | https://suzukipartsusa.com/my-account/lost-password/ |
| Store API cart | https://suzukipartsusa.com/wp-json/wc/store/v1/cart |

## Original form fields

- Login: `username`, `password`, `rememberme`.
- Register: `email`, `password`.
- Lost password: `user_login`.
- Cart API shipping address: `first_name`, `last_name`, `company`, `address_1`, `address_2`, `city`, `state`, `postcode`, `country`, `phone`.
- Cart API billing address: the shipping fields plus `email`.

Checkout field markup was not visible because an empty cart never reaches checkout.

## Shipping options

Published on the current site and in the redesigned FAQ:

- Carriers named: USPS, UPS, and DHL.
- UPS is recommended. Other options exist. Free-shipping options, where applicable, may take weeks. The store follows USPS claim rules and is not responsible for carrier delays.
- Rates are real-time from the chosen carrier for the ship-to location. No dollar amounts or free-shipping threshold were published.
- Puerto Rico is selected as the country, not as a US state. Most items ship there by USPS, and DHL may also be available.
- International: most countries via DHL. Canada and Mexico have several carrier options. Duties and taxes abroad are the buyer’s responsibility.
- Orders are often shipped by the next business day and may ship within 3 business days.
- The cart page also carried a dated October 2026 shipping-delay notice. That notice was not copied into the new cart.

## Payment methods

- FAQ: all major credit cards through PayPal. A PayPal account is not required.
- Store API payment method ids on an empty cart: `ppcp-card-button-gateway` and `woocommerce_payments`.
- No Stripe card form was verified. The new checkout does not collect card numbers.

## Account features

Verified while logged out only:

- Login, registration, remember me, and lost password.
- Logged-in dashboard, orders, downloads, and saved addresses were not visible without credentials.

## Product purchasing behavior

- Catalog products are type `simple`.
- Prices in the new frontend come from the October 14, 2026 import.
- Stock text remains “when imported.”
- A product with no imported price, or one that was out of stock at import, cannot be added.

## Unverified functionality

- Guest checkout versus required account. Empty checkout redirects to the cart.
- Filled-cart coupon field, even though the API has a coupons array.
- Exact checkout required fields, including whether phone is required.
- Logged-in account navigation and order history.
- Password reset form fields, invalid-link copy, and expired-link copy.
- Password strength rules on the live registration form.
- Whether `woocommerce_payments` is presented to customers as a card button, a wallet, or another label.
- Live shipping rate ids and which methods appear for a given address.
- Any free-shipping threshold amount.

## Return policy discrepancy

The About FAQ says 14 days and mentions a possible 20% restocking fee. The Refund and Returns page says 30 days. The new checkout links to `/returns` and does not pick one statement. The FAQ still shows both.

## Features requiring future backend integration

Authentication, registration, password reset email, live cart, coupons, shipping rates, tax, payment, and order creation. See `ECOMMERCE_INTEGRATION_HANDOFF.md`.
