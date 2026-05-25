export const TAX_RATE = 0.10; // 10%
export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_COST = 60; // ₹60 flat below threshold

export function calcShipping(subtotal) {
  return subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
}
