import api from "./api";

const FALLBACK_USER_ID = 1;

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getUserId = () => getStoredUser()?.id || FALLBACK_USER_ID;

export const getOrders = async () => {
  const response = await api.get(`/orders?user_id=${getUserId()}`);
  return response.data;
};

export const getSellerOrders = async (sellerId) => {
  const response = await api.get("/orders", {
    params: { seller_id: sellerId },
  });
  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post("/orders", {
    user_id: getUserId(),
    ...data,
  });

  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};
