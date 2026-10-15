import { AccountDetailsPage } from "./AccountDetailsPage";
import { AccountPage } from "./AccountPage";
import { AddressesPage } from "./AddressesPage";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { LoginPage } from "./LoginPage";
import { OrderDetailPage } from "./OrderDetailPage";
import { OrdersPage } from "./OrdersPage";
import { RegisterPage } from "./RegisterPage";
import { ResetPasswordPage } from "./ResetPasswordPage";

export function CommerceRoutes({ path }: { path: string }) {
  if (path === "/cart") return <CartPage />;
  if (path === "/checkout") return <CheckoutPage />;
  if (path === "/login") return <LoginPage />;
  if (path === "/register") return <RegisterPage />;
  if (path === "/forgot-password") return <ForgotPasswordPage />;
  if (path === "/reset-password") return <ResetPasswordPage />;
  if (path === "/account") return <AccountPage />;
  if (path === "/account/orders") return <OrdersPage />;
  if (path === "/account/addresses") return <AddressesPage />;
  if (path === "/account/details") return <AccountDetailsPage />;
  if (path.startsWith("/account/orders/")) {
    return <OrderDetailPage orderId={path.slice("/account/orders/".length)} />;
  }
  return null;
}
