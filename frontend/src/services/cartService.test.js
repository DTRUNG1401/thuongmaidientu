import { describe, it, expect, beforeEach, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock("./api", () => ({ default: api }));

import { getCart, saveCart, clearCart } from "./cartService";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("cartService user id resolution", () => {
  it("uses the stored user id", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 42 }));
    api.get.mockResolvedValue({ data: { items: [] } });
    await getCart();
    expect(api.get).toHaveBeenCalledWith("/cart?user_id=42");
  });

  it("falls back to user id 1 without a stored user", async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    await getCart();
    expect(api.get).toHaveBeenCalledWith("/cart?user_id=1");
  });

  it("falls back to user id 1 for corrupt storage", async () => {
    localStorage.setItem("user", "broken");
    api.get.mockResolvedValue({ data: { items: [] } });
    await getCart();
    expect(api.get).toHaveBeenCalledWith("/cart?user_id=1");
  });
});

describe("getCart", () => {
  it("returns items from the response", async () => {
    api.get.mockResolvedValue({ data: { items: [{ id: 1 }] } });
    expect(await getCart()).toEqual([{ id: 1 }]);
  });

  it("returns an empty array when items are missing", async () => {
    api.get.mockResolvedValue({ data: {} });
    expect(await getCart()).toEqual([]);
  });
});

describe("saveCart", () => {
  it("sends the user id and items", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 7 }));
    api.put.mockResolvedValue({ data: { items: [{ id: 2 }] } });
    const result = await saveCart([{ id: 2 }]);
    expect(api.put).toHaveBeenCalledWith("/cart", { user_id: 7, items: [{ id: 2 }] });
    expect(result).toEqual([{ id: 2 }]);
  });
});

describe("clearCart", () => {
  it("deletes the cart for the user", async () => {
    api.delete.mockResolvedValue({ data: { items: [] } });
    const result = await clearCart();
    expect(api.delete).toHaveBeenCalledWith("/cart?user_id=1");
    expect(result).toEqual([]);
  });
});
