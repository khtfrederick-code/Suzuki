import type { AddressBook, AddressDraft, AddressKind, CustomerProfile, SavedAddress } from "../../types/commerce";
import { readStorage, writeStorage } from "../storage";

const STORAGE_KEY = "spusa-demo-customer-v1";

type CustomerRecord = {
  profile: CustomerProfile;
  addresses: AddressBook;
};

type Listener = (record: CustomerRecord) => void;

const seedProfile: CustomerProfile = {
  firstName: "Alex",
  lastName: "Preview",
  email: "demo.customer@example.com",
  username: "demo.customer",
};

function seedAddress(kind: AddressKind): SavedAddress {
  return {
    id: `preview-${kind}`,
    firstName: "Alex",
    lastName: "Preview",
    company: "",
    address1: kind === "shipping" ? "1 Preview Street" : "2 Preview Street",
    address2: "",
    city: "Sampletown",
    state: "KY",
    postcode: "40399",
    country: "US",
    phone: "",
  };
}

function seedRecord(): CustomerRecord {
  return {
    profile: { ...seedProfile },
    addresses: {
      shipping: seedAddress("shipping"),
      billing: seedAddress("billing"),
    },
  };
}

function isRecord(value: unknown): value is CustomerRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as CustomerRecord;
  return typeof record.profile?.firstName === "string" && typeof record.addresses === "object";
}

class DemoCustomerService {
  private record = seedRecord();
  private listeners = new Set<Listener>();
  private hydrated = false;

  current() {
    this.hydrate();
    return this.record;
  }

  subscribe(listener: Listener) {
    this.hydrate();
    this.listeners.add(listener);
    listener(this.record);
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateProfile(profile: Pick<CustomerProfile, "firstName" | "lastName" | "email">) {
    this.hydrate();
    this.record = {
      ...this.record,
      profile: {
        ...this.record.profile,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
      },
    };
    this.persist();
    return this.record.profile;
  }

  saveAddress(kind: AddressKind, draft: AddressDraft) {
    this.hydrate();
    const existing = this.record.addresses[kind];
    const saved: SavedAddress = {
      ...draft,
      id: existing?.id ?? `preview-${kind}`,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      company: draft.company.trim(),
      address1: draft.address1.trim(),
      address2: draft.address2.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      postcode: draft.postcode.trim(),
      country: draft.country,
      phone: draft.phone.trim(),
    };
    this.record = {
      ...this.record,
      addresses: { ...this.record.addresses, [kind]: saved },
    };
    this.persist();
    return saved;
  }

  deleteAddress(kind: AddressKind) {
    this.hydrate();
    this.record = {
      ...this.record,
      addresses: { ...this.record.addresses, [kind]: null },
    };
    this.persist();
  }

  private hydrate() {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;
    const stored = readStorage<unknown>(localStorage, STORAGE_KEY);
    if (isRecord(stored)) {
      this.record = stored;
    }
  }

  private persist() {
    writeStorage(localStorage, STORAGE_KEY, this.record);
    this.listeners.forEach((listener) => listener(this.record));
  }
}

export const customerService = new DemoCustomerService();
export const emptyAddress = (country = "US"): AddressDraft => ({
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country,
  phone: "",
});
