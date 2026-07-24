import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  readLikedProducts,
  getProductLikeKey,
  isProductLiked,
  toggleProductLike,
} from "./likes";

const STORAGE_KEY = "likedProducts";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("readLikedProducts", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(readLikedProducts()).toEqual([]);
  });

  it("returns stored ids as strings", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2]));
    expect(readLikedProducts()).toEqual(["1", "2"]);
  });

  it("returns an empty array for corrupt data", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(readLikedProducts()).toEqual([]);
  });

  it("returns an empty array when stored value is not an array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }));
    expect(readLikedProducts()).toEqual([]);
  });
});

describe("getProductLikeKey", () => {
  it("prefers id", () => {
    expect(getProductLikeKey({ id: 7, name: "X" })).toBe("7");
  });

  it("falls back to name", () => {
    expect(getProductLikeKey({ name: "X" })).toBe("X");
  });

  it("returns empty string when nothing identifies the product", () => {
    expect(getProductLikeKey({})).toBe("");
    expect(getProductLikeKey(null)).toBe("");
  });
});

describe("isProductLiked", () => {
  it("is true when key is present", () => {
    expect(isProductLiked({ id: 3 }, ["3"])).toBe(true);
  });

  it("is false when key is absent", () => {
    expect(isProductLiked({ id: 3 }, ["9"])).toBe(false);
  });

  it("is false for an unidentifiable product", () => {
    expect(isProductLiked({}, [""])).toBe(false);
  });
});

describe("toggleProductLike", () => {
  it("adds a like and persists it", () => {
    const listener = vi.fn();
    window.addEventListener("liked-products-change", listener);

    const updated = toggleProductLike({ id: 5 }, []);

    expect(updated).toEqual(["5"]);
    expect(readLikedProducts()).toEqual(["5"]);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("removes an existing like", () => {
    const updated = toggleProductLike({ id: 5 }, ["5"]);
    expect(updated).toEqual([]);
    expect(readLikedProducts()).toEqual([]);
  });

  it("reads current likes from storage when not provided", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(["1"]));
    const updated = toggleProductLike({ id: 2 });
    expect(updated).toEqual(["1", "2"]);
  });

  it("does nothing for an unidentifiable product", () => {
    const current = ["1"];
    expect(toggleProductLike({}, current)).toBe(current);
  });
});
