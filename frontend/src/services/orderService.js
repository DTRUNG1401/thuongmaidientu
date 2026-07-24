import api from "./api";
import { getUserId } from "../utils/auth";

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
