import api from "./api";
import { getUserId } from "../utils/auth";

export const getCart = async () => {
  const response = await api.get(`/cart?user_id=${getUserId()}`);
  return response.data.items || [];
};

export const saveCart = async (items) => {
  const response = await api.put("/cart", {
    user_id: getUserId(),
    items,
  });

  return response.data.items || [];
};

export const clearCart = async () => {
  const response = await api.delete(`/cart?user_id=${getUserId()}`);
  return response.data.items || [];
};
