import api from "./api";

export const login = async (data) => {
  return await api.post("/login", data);
};

export const register = async (data) => {
  return await api.post("/register", data);
};

export const registerSeller = async (data) => {
  return await api.post("/seller/register", data);
};
