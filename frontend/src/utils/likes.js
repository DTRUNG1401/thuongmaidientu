const STORAGE_KEY = "likedProducts";

export function readLikedProducts() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export function getProductLikeKey(product) {
  return String(product?.id || product?.name || "");
}

export function isProductLiked(product, likedProducts) {
  const key = getProductLikeKey(product);
  return Boolean(key && likedProducts.includes(key));
}

export function toggleProductLike(product, likedProducts = readLikedProducts()) {
  const key = getProductLikeKey(product);
  if (!key) return likedProducts;

  const updated = likedProducts.includes(key)
    ? likedProducts.filter((item) => item !== key)
    : [...likedProducts, key];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("liked-products-change"));
  return updated;
}
