import { describe, it, expect, beforeEach, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock("./api", () => ({ default: api }));

import {
  sampleCategories,
  sampleProducts,
  getProducts,
  getProductsByCategory,
  getCategories,
  getProductById,
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
} from "./productService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sample data", () => {
  it("exposes ten sample categories with names", () => {
    expect(sampleCategories).toHaveLength(10);
    expect(sampleCategories.every((c) => typeof c.name === "string")).toBe(true);
  });

  it("exposes sample products with prices", () => {
    expect(sampleProducts.length).toBeGreaterThan(0);
    expect(sampleProducts.every((p) => typeof p.price === "number")).toBe(true);
  });
});

describe("read endpoints", () => {
  it("getProducts forwards params", async () => {
    api.get.mockResolvedValue({ data: [] });
    await getProducts({ q: "x" });
    expect(api.get).toHaveBeenCalledWith("/products", { params: { q: "x" } });
  });

  it("getProductsByCategory filters by category", async () => {
    api.get.mockResolvedValue({ data: [] });
    await getProductsByCategory("Sách");
    expect(api.get).toHaveBeenCalledWith("/products", { params: { category: "Sách" } });
  });

  it("getCategories hits the categories endpoint", async () => {
    api.get.mockResolvedValue({ data: [] });
    await getCategories();
    expect(api.get).toHaveBeenCalledWith("/categories");
  });

  it("getProductById builds the url", async () => {
    api.get.mockResolvedValue({ data: { id: 3 } });
    const result = await getProductById(3);
    expect(api.get).toHaveBeenCalledWith("/products/3");
    expect(result).toEqual({ id: 3 });
  });

  it("getSellerProducts filters by seller", async () => {
    api.get.mockResolvedValue({ data: [] });
    await getSellerProducts(2);
    expect(api.get).toHaveBeenCalledWith("/products", { params: { seller_id: 2 } });
  });
});

describe("write endpoints", () => {
  it("createProduct posts the product", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    await createProduct({ name: "X" });
    expect(api.post).toHaveBeenCalledWith("/products", { name: "X" });
  });

  it("updateProduct puts to the product url", async () => {
    api.put.mockResolvedValue({ data: { id: 1 } });
    await updateProduct(1, { name: "Y" });
    expect(api.put).toHaveBeenCalledWith("/products/1", { name: "Y" });
  });

  it("deleteProduct deletes by id", async () => {
    api.delete.mockResolvedValue({ data: { message: "deleted" } });
    const result = await deleteProduct(4);
    expect(api.delete).toHaveBeenCalledWith("/products/4");
    expect(result).toEqual({ message: "deleted" });
  });
});
