# Ecommerce integration handoff

This frontend is a preview. Demo adapters keep the cart, a demo session, and preview addresses in the browser. They do not call WooCommerce, PayPal, or WooCommerce Payments.

Replace the demo adapters. Leave the page components on the service interfaces.

## 1. Frontend architecture

- React 19, TypeScript, Vite. Routes are pathname checks in `src/App.tsx`, using normal links and full page loads.
- `CommerceProvider` in `src/context/CommerceContext.tsx` wraps the app and is what header, product, cart, checkout, and account screens call through `useCommerce()`.
- Shop catalog data stays in `src/data/catalog`. Commerce pages are a separate lazy chunk.

## 2. Commerce routes

| Route | Screen |
| --- | --- |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/login` | Sign in |
| `/register` | Registration preview |
| `/forgot-password` | Reset request preview |
| `/reset-password` | New-password preview. `?preview=invalid`, `?preview=expired`, and `?preview=complete` show those states |
| `/account` | Overview |
| `/account/orders` | Order list |
| `/account/orders/:id` | Order detail |
| `/account/addresses` | Addresses |
| `/account/details` | Profile and password preview |

## 3. Shared commerce components

- `src/components/commerce/CommerceRoutes.tsx`
- `CartPage.tsx`, `CheckoutPage.tsx`, `AddressFields.tsx`
- `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `PasswordField.tsx`
- `AccountLayout.tsx`, `AccountPage.tsx`, `OrdersPage.tsx`, `OrderDetailPage.tsx`, `AddressesPage.tsx`, `AccountDetailsPage.tsx`
- Header cart and account controls in `src/components/Header.tsx`
- Add to Cart on `src/components/shop/ProductPage.tsx`
- Styles in `src/styles/commerce.css`

## 4. Authentication service

`src/services/auth/demoAuth.ts`

- `current()`, `subscribe()`, `signIn({ username, password, remember })`, `signOut()`, `previewPasswordChange()`
- Session shape: `{ userId, username, email, remember, demo: true }`
- The only accepted preview identity is username `demo.customer`, email `demo.customer@example.com`, password `preview-only`.
- The password is compared in memory and is never written to storage.

Replace `signIn` with the real WooCommerce or account login. Keep the session object, or map it in the provider, so the header can still choose `/account` versus `/login`.

## 5. Cart service

`src/services/cart/demoCart.ts`

- `current()`, `subscribe()`, `addItem()`, `setQuantity()`, `removeLine()`
- Storage key: `spusa-demo-cart-v1`
- Line identity is `productId:variationId:sorted attributes`
- Quantity cap of 99 is a preview form limit, not stock.

## 6. Checkout service

`src/services/checkout/demoCheckout.ts`

- `shippingMethods()`, `paymentMethods()`, `validate()`, `placeOrder()`
- `placeOrder()` always returns a failure. The Place Order button is disabled.
- `validateCheckout()` is the current required-field set: email, shipping address, billing address unless it matches shipping, a carrier choice, and a payment-method choice. Phone is optional.

## 7. Customer service

`src/services/customer/demoCustomer.ts`

- Profile and one shipping address plus one billing address.
- Storage key: `spusa-demo-customer-v1`
- `updateProfile()`, `saveAddress()`, `deleteAddress()`

## 8. Orders service

`src/services/orders/demoOrders.ts`

- `list()` and `get(id)`
- One sample order, `PREVIEW-1001`, built from imported product 111285.
- The orders page can also show an empty preview. That empty list is local UI state.

## 9. Demo adapters

| Adapter | File |
| --- | --- |
| Cart | `src/services/cart/demoCart.ts` |
| Auth | `src/services/auth/demoAuth.ts` |
| Customer | `src/services/customer/demoCustomer.ts` |
| Orders | `src/services/orders/demoOrders.ts` |
| Checkout | `src/services/checkout/demoCheckout.ts` |
| Price and stock checks | `src/services/catalog/demoCatalogCommerce.ts` |

`demoCatalogCommerce.ts` is the interface for live price and stock checks. It is not called yet. Both methods return `status: "unchecked"`.

## 10. How to replace demo adapters

1. Implement the same methods against the Store API or the existing WooCommerce session.
2. Point `CommerceContext.tsx` at those implementations.
3. Keep pages on `useCommerce()` and `checkoutService`.
4. Remove demo storage keys and the preview password.
5. Enable Place Order only after `placeOrder()` can create a real order and hand off to the verified payment methods.

Shared domain types live in `src/types/commerce.ts`.

## 11. Product ID mapping

Cart and order lines store the WooCommerce product id from the import (`CatalogProduct.id`, numeric). The product slug is for links only. Do not match catalog rows by name.

## 12. Product variation mapping

`variationId` is `number | null`. `attributes` is `Record<string, string>`.

Every imported product is type `simple`, so Add to Cart sends `variationId: null` and an empty attribute map. There is no variation picker. When a variable product appears, require each attribute before calling `addItem`, and send the variation id.

## 13. Expected cart session behavior

The preview cart survives refresh in `localStorage` and is not tied to the demo login. A real integration should decide whether the guest cart merges into the customer cart at login. That merge is not implemented.

## 14. Guest cart requirements

The cart works while signed out. Checkout does not require the demo session. Whether the live store allows guest checkout was not visible, because empty `/checkout/` redirects to `/cart/`.

## 15. Customer login requirements

Live login accepts username or email, password, and Remember me. The preview copies that. Remember me stores only `{ userId, remember }` under `spusa-demo-session-v1` in `localStorage`. Otherwise the same payload is in `sessionStorage`.

## 16. Registration requirements

The live public form asks for email and password only. The preview also collects first name, last name, and password confirmation, and it requires 8 characters. No account is created and the password is cleared after the preview message. The live password rule was not published.

## 17. Password recovery integration

`/forgot-password` must eventually call the lost-password endpoint and must not claim mail was sent until the API says so. `/reset-password` must accept the real key and login query parameters. The `preview` query values exist only to show invalid, expired, and complete states.

## 18. Shipping carrier integration points

Preview choices are UPS (`ups`), USPS (`usps`), and DHL (`dhl`). These are not live rate ids. Replace them with `shipping_rates` from the Store API cart after an address is set.

Show UPS as the recommended carrier. Mention that free-shipping options, when the backend marks them, can take weeks. Do not invent a threshold.

Puerto Rico must remain a country option, not a US state.

## 19. Shipping rate calculation integration points

`ShippingMethod.amount` is always `null`. The UI says “Rate pending” and “Pending calculation.” When the backend returns a rate, put that amount on the method and stop labeling it as a quote from this preview.

## 20. Tax calculation integration points

The summary says “Pending calculation.” Do not hard-code 6%. The FAQ states that Kentucky orders are taxed at 6% and that other destination states may also be taxed. Display the tax lines returned by the cart totals.

## 21. Payment provider integration points

Payment choices:

- `ppcp-card-button-gateway` — PayPal. A PayPal account is not required.
- `woocommerce_payments` — the other method id on the public cart payload.

Do not add card-number or CVV fields. Mount the provider’s button or hosted fields in the payment section when Place Order is enabled.

## 22. Order creation integration points

`checkoutService.placeOrder()` is the only submit function, and it always fails. The button stays disabled. After a real order is created, route to the provider’s return URL or an order-received screen. Do not invent an order number in the preview.

## 23. Order history data requirements

`CustomerOrder` needs `id`, `number`, `placedOn`, `status`, `lines`, `subtotal`, and a customer-visible note. Lines need `productId`, `variationId`, `name`, `slug`, `sku`, `image`, `quantity`, and `unitPrice`. Shipping and tax should come from the order payload rather than staying “pending” once the API provides them.

`PREVIEW-1001` must disappear when real orders load. Keep the empty state for customers with no orders.

## 24. Customer address management

One shipping address and one billing address. Fields match the cart API: name, company, two address lines, city, state, postcode, country, phone. Country codes are ISO-like values in `src/data/demo/regions.ts`. US states and Canadian provinces are selects. Other countries use an optional state field. US ZIP codes are checked as 5 digits or ZIP+4. Other postal codes are only required to be non-empty.

## 25. Environment variables needed later

None are used now. A later connection will likely need the store API base URL, a cart nonce or cookie strategy, and the PayPal and WooCommerce Payments client configuration. Do not put secrets in the frontend beyond what those providers already require for their public client tokens.

## 26. Demo-only interactions

- Sign-in as `demo.customer` / `preview-only`
- Registration success copy
- Password reset request, invalid link, expired link, and completion copy
- Password change on account details
- `PREVIEW-1001` and the empty-orders toggle
- Preview addresses for Alex Preview in Sampletown
- Coupon Apply, which reports that no discount was applied
- Shipping and tax rows that say pending
- Disabled Place Order

## 27. Features that need a backend connection

Login, registration, password email, live cart and stock checks, coupon validation, shipping rates, tax, payment, order creation, and real order history.

## 28. Verified business rules

- Carriers: UPS, USPS, DHL. UPS is recommended.
- Free shipping exists only where the store marks it, with no published dollar threshold.
- Puerto Rico is a country for shipping.
- International duties are the buyer’s responsibility.
- PayPal card checkout is offered without requiring a PayPal account. `woocommerce_payments` is also listed.
- Kentucky’s published in-state sales-tax note is 6%, with possible destination tax elsewhere.
- Login is username or email, with Remember me.
- Public registration is email and password.
- Lost password asks for username or email.
- Imported products are simple products.
- Return windows disagree: 14 days on the About FAQ and 30 days on `/returns`.

## 29. Unverified original behavior

Guest checkout, filled-cart coupons, logged-in account menus, reset-link fields, live rate ids, and the customer-facing label for `woocommerce_payments`.

## 30. Remaining work before production

- Replace every demo adapter.
- Recalculate price and stock on add and on checkout.
- Load shipping rates after the address is valid.
- Load tax totals.
- Mount PayPal and WooCommerce Payments without custom card fields.
- Enable Place Order only for a real order request.
- Merge guest and customer carts if the live store does that.
- Remove preview copy, preview orders, and the demo password.
- Confirm the return-window discrepancy before showing a single policy in checkout.
