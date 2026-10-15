import type {
  AddressDraft,
  CheckoutDraft,
  FieldErrors,
  PaymentMethodOption,
  ServiceResult,
  ShippingMethod,
} from "../../types/commerce";
import { regionsFor } from "../../data/demo/regions";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const shippingMethods: ShippingMethod[] = [
  {
    id: "ups",
    carrier: "UPS",
    label: "UPS",
    detail: "Recommended by Suzuki Parts USA. The rate is calculated from the destination.",
    amount: null,
    pending: true,
  },
  {
    id: "usps",
    carrier: "USPS",
    label: "USPS",
    detail: "Available for the ship-to address.",
    amount: null,
    pending: true,
  },
  {
    id: "dhl",
    carrier: "DHL",
    label: "DHL",
    detail: "Used for international shipping and some Puerto Rico shipments.",
    amount: null,
    pending: true,
  },
];

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "ppcp-card-button-gateway",
    label: "PayPal",
    detail: "A PayPal account is not required.",
  },
  {
    id: "woocommerce_payments",
    label: "WooCommerce Payments",
    detail: "Card payment through the store checkout.",
  },
];

function requireText(errors: FieldErrors, key: string, value: string, message: string) {
  if (!value.trim()) {
    errors[key] = message;
  }
}

function validateAddress(errors: FieldErrors, prefix: "shipping" | "billing", address: AddressDraft) {
  requireText(errors, `${prefix}.firstName`, address.firstName, "Enter a first name.");
  requireText(errors, `${prefix}.lastName`, address.lastName, "Enter a last name.");
  requireText(errors, `${prefix}.address1`, address.address1, "Enter a street address.");
  requireText(errors, `${prefix}.city`, address.city, "Enter a city.");
  requireText(errors, `${prefix}.country`, address.country, "Choose a country.");
  requireText(errors, `${prefix}.postcode`, address.postcode, "Enter a postal code.");
  const regions = regionsFor(address.country);
  if (regions && regions.length > 0) {
    requireText(errors, `${prefix}.state`, address.state, "Choose a state or province.");
  }
  if (address.country === "US" && address.postcode.trim() && !/^\d{5}(-\d{4})?$/.test(address.postcode.trim())) {
    errors[`${prefix}.postcode`] = "Enter a 5-digit US ZIP code.";
  }
  const digits = address.phone.replace(/\D/g, "");
  if (address.phone.trim() && digits.length < 7) {
    errors[`${prefix}.phone`] = "Enter a phone number with at least 7 digits, or leave it blank.";
  }
}

export function validateCheckout(draft: CheckoutDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!emailPattern.test(draft.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  const phoneDigits = draft.phone.replace(/\D/g, "");
  if (draft.phone.trim() && phoneDigits.length < 7) {
    errors.phone = "Enter a phone number with at least 7 digits, or leave it blank.";
  }
  validateAddress(errors, "shipping", draft.shipping);
  if (!draft.billingSameAsShipping) {
    validateAddress(errors, "billing", draft.billing);
  }
  if (!draft.shippingMethodId) {
    errors.shippingMethodId = "Choose a carrier. The rate is still pending.";
  }
  if (!draft.paymentMethodId) {
    errors.paymentMethodId = "Choose a payment method. Card details are not collected here.";
  }
  return errors;
}

export const checkoutService = {
  shippingMethods() {
    return shippingMethods;
  },
  paymentMethods() {
    return paymentMethods;
  },
  validate: validateCheckout,
  async placeOrder(): Promise<ServiceResult<never>> {
    return {
      ok: false,
      message: "Place Order is off until payment and order creation are connected. No order was submitted.",
    };
  },
};

export function validateAddressDraft(address: AddressDraft, prefix = "address"): FieldErrors {
  const errors: FieldErrors = {};
  validateAddress(errors, "shipping", address);
  if (prefix === "address") {
    const renamed: FieldErrors = {};
    for (const [key, value] of Object.entries(errors)) {
      renamed[key.replace(/^shipping\./, "")] = value;
    }
    return renamed;
  }
  return errors;
}
