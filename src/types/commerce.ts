export type SelectedAttributes = Record<string, string>;

export type CartLine = {
  lineId: string;
  productId: number;
  variationId: number | null;
  attributes: SelectedAttributes;
  quantity: number;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  unitPrice: number;
  regularPrice: number | null;
  backendItemId: string | null;
};

export type CartSnapshot = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
};

export type AddCartItemInput = {
  productId: number;
  variationId: number | null;
  attributes: SelectedAttributes;
  quantity: number;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  unitPrice: number;
  regularPrice: number | null;
};

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export type FieldErrors = Record<string, string>;

export type AuthSession = {
  userId: string;
  username: string;
  email: string;
  remember: boolean;
  demo: true;
};

export type SignInInput = {
  username: string;
  password: string;
  remember: boolean;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type PasswordChangeInput = {
  password: string;
  confirmPassword: string;
};

export type CustomerProfile = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

export type AddressDraft = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
};

export type SavedAddress = AddressDraft & {
  id: string;
};

export type AddressBook = {
  shipping: SavedAddress | null;
  billing: SavedAddress | null;
};

export type AddressKind = "shipping" | "billing";

export type OrderLine = {
  productId: number;
  variationId: number | null;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
};

export type CustomerOrder = {
  id: string;
  number: string;
  placedOn: string;
  status: string;
  lines: OrderLine[];
  subtotal: number;
  preview: true;
  note: string;
};

export type CheckoutContact = {
  email: string;
  phone: string;
};

export type CheckoutDraft = {
  email: string;
  phone: string;
  shipping: AddressDraft;
  billingSameAsShipping: boolean;
  billing: AddressDraft;
  shippingMethodId: string;
  paymentMethodId: string;
};

export type ShippingMethod = {
  id: string;
  carrier: "UPS" | "USPS" | "DHL";
  label: string;
  detail: string;
  amount: null;
  pending: true;
};

export type PaymentMethodOption = {
  id: string;
  label: string;
  detail: string;
};

export type PriceCheck = {
  status: "unchecked";
  productId: number;
  variationId: number | null;
  displayedPrice: number;
  message: string;
};

export type StockCheck = {
  status: "unchecked";
  productId: number;
  variationId: number | null;
  quantity: number;
  message: string;
};
