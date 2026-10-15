import type { AddCartItemInput, CartLine, CartSnapshot, SelectedAttributes, ServiceResult } from "../../types/commerce";
import { previewDelay, readStorage, writeStorage } from "../storage";

const STORAGE_KEY = "spusa-demo-cart-v1";
const MAX_QTY = 99;

type Listener = (cart: CartSnapshot) => void;

function attributeKey(attributes: SelectedAttributes) {
  return Object.keys(attributes)
    .sort()
    .map((key) => `${key}=${attributes[key]}`)
    .join("&");
}

function lineIdFor(input: Pick<AddCartItemInput, "productId" | "variationId" | "attributes">) {
  return `${input.productId}:${input.variationId ?? "simple"}:${attributeKey(input.attributes)}`;
}

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") {
    return false;
  }
  const line = value as Partial<CartLine>;
  return (
    typeof line.lineId === "string" &&
    typeof line.productId === "number" &&
    (line.variationId === null || typeof line.variationId === "number") &&
    typeof line.quantity === "number" &&
    typeof line.name === "string" &&
    typeof line.slug === "string" &&
    typeof line.sku === "string" &&
    typeof line.unitPrice === "number" &&
    line.attributes !== null &&
    typeof line.attributes === "object"
  );
}

function snapshot(lines: CartLine[]): CartSnapshot {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = money(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  return { lines, itemCount, subtotal };
}

class DemoCartService {
  private lines: CartLine[] = [];
  private listeners = new Set<Listener>();
  private hydrated = false;
  loadError: string | null = null;

  current() {
    this.hydrate();
    return snapshot(this.lines);
  }

  subscribe(listener: Listener) {
    this.hydrate();
    this.listeners.add(listener);
    listener(snapshot(this.lines));
    return () => {
      this.listeners.delete(listener);
    };
  }

  async addItem(input: AddCartItemInput): Promise<ServiceResult<CartSnapshot>> {
    await previewDelay();
    this.hydrate();
    if (!Number.isFinite(input.unitPrice)) {
      return { ok: false, message: "This part has no imported price, so it cannot be added." };
    }
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      return { ok: false, message: "Enter a quantity of at least 1." };
    }
    const lineId = lineIdFor(input);
    const existing = this.lines.find((line) => line.lineId === lineId);
    const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
    if (nextQuantity > MAX_QTY) {
      return { ok: false, message: `Quantity is limited to ${MAX_QTY}.` };
    }
    if (existing) {
      existing.quantity = nextQuantity;
      existing.unitPrice = input.unitPrice;
      existing.name = input.name;
      existing.image = input.image;
      existing.sku = input.sku;
    } else {
      this.lines.push({
        lineId,
        productId: input.productId,
        variationId: input.variationId,
        attributes: { ...input.attributes },
        quantity: input.quantity,
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        image: input.image,
        unitPrice: input.unitPrice,
        regularPrice: input.regularPrice,
        backendItemId: null,
      });
    }
    this.persist();
    return { ok: true, data: snapshot(this.lines) };
  }

  setQuantity(lineId: string, quantity: number): ServiceResult<CartSnapshot> {
    this.hydrate();
    const line = this.lines.find((item) => item.lineId === lineId);
    if (!line) {
      return { ok: false, message: "That part is no longer in the cart." };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      return { ok: false, message: `Enter a quantity from 1 to ${MAX_QTY}.` };
    }
    line.quantity = quantity;
    this.persist();
    return { ok: true, data: snapshot(this.lines) };
  }

  removeLine(lineId: string) {
    this.hydrate();
    this.lines = this.lines.filter((line) => line.lineId !== lineId);
    this.persist();
    return snapshot(this.lines);
  }

  private hydrate() {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;
    try {
      const stored = readStorage<unknown>(localStorage, STORAGE_KEY);
      if (!stored) {
        return;
      }
      if (!Array.isArray(stored) || !stored.every(isLine)) {
        this.loadError = "The saved cart could not be read, so the cart was cleared.";
        this.lines = [];
        writeStorage(localStorage, STORAGE_KEY, []);
        return;
      }
      this.lines = stored.map((line) => ({
        ...line,
        attributes: { ...line.attributes },
        image: line.image ?? null,
        regularPrice: line.regularPrice ?? null,
        backendItemId: line.backendItemId ?? null,
      }));
    } catch {
      this.loadError = "The saved cart could not be read, so the cart was cleared.";
      this.lines = [];
    }
  }

  private persist() {
    writeStorage(localStorage, STORAGE_KEY, this.lines);
    const next = snapshot(this.lines);
    this.listeners.forEach((listener) => listener(next));
  }
}

export const cartService = new DemoCartService();
