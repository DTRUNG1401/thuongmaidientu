import { describe, it, expect, beforeEach, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("./api", () => ({ default: api }));

import {
  getOrders,
  getSellerOrders,
  createOrder,
  updateOrderStatus,
} from "./orderService";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("getOrders", () => {
  it("requests orders for the stored user", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 8 }));
    api.get.mockResolvedValue({ data: [{ id: 1 }] });
    const result = await getOrders();
    expect(api.get).toHaveBeenCalledWith("/orders?user_id=8");
    expect(result).toEqual([{ id: 1 }]);
  });

  it("defaults to user id 1", async () => {
    api.get.mockResolvedValue({ data: [] });
    await getOrders();
    expect(api.get).toHaveBeenCalledWith("/orders?user_id=1");
  });
});

describe("getSellerOrders", () => {
  it("passes the seller id as a query param", async () => {
    api.get.mockResolvedValue({ data: [] });
    await getSellerOrders(3);
    expect(api.get).toHaveBeenCalledWith("/orders", { params: { seller_id: 3 } });
  });
});

describe("createOrder", () => {
  it("merges the user id into the payload", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 9 }));
    api.post.mockResolvedValue({ data: { id: 1 } });
    await createOrder({ total: 1000, items: [] });
    expect(api.post).toHaveBeenCalledWith("/orders", {
      user_id: 9,
      total: 1000,
      items: [],
    });
  });
});

describe("updateOrderStatus", () => {
  it("puts the new status", async () => {
    api.put.mockResolvedValue({ data: { status: "shipped" } });
    const result = await updateOrderStatus(5, "shipped");
    expect(api.put).toHaveBeenCalledWith("/orders/5/status", { status: "shipped" });
    expect(result).toEqual({ status: "shipped" });
  });
});
