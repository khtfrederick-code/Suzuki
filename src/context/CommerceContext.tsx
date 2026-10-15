import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AddCartItemInput,
  AddressBook,
  AddressDraft,
  AddressKind,
  AuthSession,
  CartSnapshot,
  CustomerProfile,
  ServiceResult,
  SignInInput,
} from "../types/commerce";
import { authService } from "../services/auth/demoAuth";
import { cartService } from "../services/cart/demoCart";
import { customerService } from "../services/customer/demoCustomer";

type CommerceValue = {
  cart: CartSnapshot;
  cartError: string | null;
  addItem: (input: AddCartItemInput) => Promise<ServiceResult<CartSnapshot>>;
  setQuantity: (lineId: string, quantity: number) => ServiceResult<CartSnapshot>;
  removeLine: (lineId: string) => void;
  session: AuthSession | null;
  authBusy: boolean;
  signIn: (input: SignInInput) => Promise<ServiceResult<AuthSession>>;
  signOut: () => void;
  profile: CustomerProfile;
  updateProfile: (profile: Pick<CustomerProfile, "firstName" | "lastName" | "email">) => void;
  addresses: AddressBook;
  saveAddress: (kind: AddressKind, draft: AddressDraft) => void;
  deleteAddress: (kind: AddressKind) => void;
};

const CommerceContext = createContext<CommerceValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartSnapshot>(() => cartService.current());
  const [cartError, setCartError] = useState<string | null>(cartService.loadError);
  const [session, setSession] = useState<AuthSession | null>(() => authService.current());
  const [authBusy, setAuthBusy] = useState(false);
  const [customer, setCustomer] = useState(() => customerService.current());

  useEffect(() => cartService.subscribe(setCart), []);
  useEffect(() => authService.subscribe(setSession), []);
  useEffect(() => customerService.subscribe(setCustomer), []);

  const value = useMemo<CommerceValue>(
    () => ({
      cart,
      cartError,
      addItem: async (input) => {
        const result = await cartService.addItem(input);
        setCartError(cartService.loadError);
        return result;
      },
      setQuantity: (lineId, quantity) => cartService.setQuantity(lineId, quantity),
      removeLine: (lineId) => {
        cartService.removeLine(lineId);
      },
      session,
      authBusy,
      signIn: async (input) => {
        setAuthBusy(true);
        try {
          return await authService.signIn(input);
        } finally {
          setAuthBusy(false);
        }
      },
      signOut: () => authService.signOut(),
      profile: customer.profile,
      updateProfile: (profile) => {
        customerService.updateProfile(profile);
      },
      addresses: customer.addresses,
      saveAddress: (kind, draft) => {
        customerService.saveAddress(kind, draft);
      },
      deleteAddress: (kind) => {
        customerService.deleteAddress(kind);
      },
    }),
    [authBusy, cart, cartError, customer, session],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }
  return value;
}
