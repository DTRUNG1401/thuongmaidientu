import { describe, it, expect } from "vitest";
import {
  formatPrice,
  getDiscountPercent,
  hasDiscount,
  getOriginalPrice,
  getSalePrice,
  getCartProduct,
} from "./pricing";

describe("formatPrice", () => {
  it("formats a number as VND currency", () => {
    // Non-breaking spaces are used by Intl for vi-VN, so assert on digits + symbol.
    const formatted = formatPrice(1000);
    expect(formatted).toMatch(/1\.000/);
    expect(formatted).toContain("₫");
  });

  it("falls back to 0 for non-numeric input", () => {
    expect(formatPrice("abc")).toMatch(/0/);
  });
});

describe("getDiscountPercent", () => {
  it("returns the discount when in range", () => {
    expect(getDiscountPercent({ discount_percent: 25 })).toBe(25);
  });

  it("clamps values above 90", () => {
    expect(getDiscountPercent({ discount_percent: 150 })).toBe(90);
  });

  it("clamps negative values to 0", () => {
    expect(getDiscountPercent({ discount_percent: -10 })).toBe(0);
  });

  it("defaults to 0 when missing", () => {
    expect(getDiscountPercent({})).toBe(0);
    expect(getDiscountPercent(null)).toBe(0);
  });
});

describe("hasDiscount", () => {
  it("is true when discount is positive", () => {
    expect(hasDiscount({ discount_percent: 5 })).toBe(true);
  });

  it("is false when there is no discount", () => {
    expect(hasDiscount({ discount_percent: 0 })).toBe(false);
  });
});

describe("getOriginalPrice", () => {
  it("prefers original_price", () => {
    expect(getOriginalPrice({ original_price: 500, price: 400 })).toBe(500);
  });

  it("falls back to price", () => {
    expect(getOriginalPrice({ price: 400 })).toBe(400);
  });

  it("defaults to 0", () => {
    expect(getOriginalPrice({})).toBe(0);
  });
});

describe("getSalePrice", () => {
  it("uses an explicit positive sale_price", () => {
    expect(getSalePrice({ sale_price: 300, price: 1000 })).toBe(300);
  });

  it("computes from discount when no sale_price", () => {
    expect(getSalePrice({ price: 1000, discount_percent: 20 })).toBe(800);
  });

  it("rounds computed price", () => {
    expect(getSalePrice({ price: 999, discount_percent: 10 })).toBe(899);
  });

  it("ignores non-positive sale_price", () => {
    expect(getSalePrice({ sale_price: 0, price: 1000, discount_percent: 10 })).toBe(900);
  });
});

describe("getCartProduct", () => {
  it("normalises pricing fields", () => {
    const result = getCartProduct({ id: 1, name: "X", price: 1000, discount_percent: 10 });
    expect(result.original_price).toBe(1000);
    expect(result.sale_price).toBe(900);
    expect(result.price).toBe(900);
    expect(result.name).toBe("X");
  });
});
