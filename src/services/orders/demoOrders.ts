import orderProducts from "../../data/demo/order-products.json";
import type { CustomerOrder, OrderLine } from "../../types/commerce";

function lineFromProduct(productId: number, quantity: number): OrderLine {
  const product = orderProducts.find((item) => item.productId === productId);
  if (!product) {
    throw new Error(`Missing order product ${productId}`);
  }
  return {
    productId: product.productId,
    variationId: product.variationId,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    image: product.image,
    quantity,
    unitPrice: product.unitPrice,
  };
}

const wiper = lineFromProduct(111285, 1);

const orders: CustomerOrder[] = [
  {
    id: "1001",
    number: "1001",
    placedOn: "2026-09-12",
    status: "Processing",
    lines: [wiper],
    subtotal: Math.round(wiper.unitPrice * wiper.quantity * 100) / 100,
    preview: true,
    note: "",
  },
];

export const orderService = {
  list(): CustomerOrder[] {
    return orders;
  },
  get(id: string): CustomerOrder | null {
    return orders.find((order) => order.id === id) ?? null;
  },
};
