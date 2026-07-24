export function readJsonArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeJsonArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const readLocalCart = () => readJsonArray("cart");
export const writeLocalCart = (items) => writeJsonArray("cart", items);
export const removeLocalCart = () => localStorage.removeItem("cart");

export const readLocalOrders = () => readJsonArray("orders");
export const writeLocalOrders = (orders) => writeJsonArray("orders", orders);
