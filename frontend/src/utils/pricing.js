export const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(price) || 0);

export const getDiscountPercent = (product) => {
  const discount = Number(product?.discount_percent || 0);
  if (!Number.isFinite(discount)) return 0;
  return Math.min(Math.max(discount, 0), 90);
};

export const hasDiscount = (product) => getDiscountPercent(product) > 0;

export const getOriginalPrice = (product) => Number(product?.original_price ?? product?.price ?? 0) || 0;

export const getSalePrice = (product) => {
  const salePrice = Number(product?.sale_price);
  if (Number.isFinite(salePrice) && salePrice > 0) return salePrice;

  const originalPrice = getOriginalPrice(product);
  return Math.round(originalPrice * (100 - getDiscountPercent(product)) / 100);
};

export const getCartProduct = (product) => ({
  ...product,
  original_price: getOriginalPrice(product),
  sale_price: getSalePrice(product),
  price: getSalePrice(product),
});
