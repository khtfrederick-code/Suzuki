import type { PriceCheck, StockCheck } from "../../types/commerce";

const message = "Live price and stock are not verified in this preview. The imported catalog values are display only.";

export const catalogCommerceService = {
  async validatePrice(productId: number, variationId: number | null, displayedPrice: number): Promise<PriceCheck> {
    return { status: "unchecked", productId, variationId, displayedPrice, message };
  },
  async validateStock(productId: number, variationId: number | null, quantity: number): Promise<StockCheck> {
    return { status: "unchecked", productId, variationId, quantity, message };
  },
};
