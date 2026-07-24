import { describe, it, expect } from "vitest";
import { getImageUrl, fallbackImage } from "./images";

const API_ORIGIN = "http://localhost:5000";

describe("getImageUrl", () => {
  it("returns fallback for empty input", () => {
    expect(getImageUrl("")).toBe(fallbackImage);
    expect(getImageUrl(null)).toBe(fallbackImage);
  });

  it("returns fallback for the 'd' placeholder", () => {
    expect(getImageUrl("d")).toBe(fallbackImage);
  });

  it("returns fallback for non-string input", () => {
    expect(getImageUrl(123)).toBe(fallbackImage);
  });

  it("passes through absolute http urls", () => {
    const url = "https://cdn.example.com/a.png";
    expect(getImageUrl(url)).toBe(url);
  });

  it("passes through data and blob urls", () => {
    expect(getImageUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
    expect(getImageUrl("blob:abc")).toBe("blob:abc");
  });

  it("resolves known local images to a bundled asset", () => {
    const resolved = getImageUrl("2.webp");
    expect(typeof resolved).toBe("string");
    expect(resolved).not.toBe(fallbackImage);
  });

  it("prefixes uploaded files with the API origin", () => {
    expect(getImageUrl("/uploads/x.webp")).toBe(`${API_ORIGIN}/uploads/x.webp`);
  });

  it("returns root-relative paths untouched", () => {
    expect(getImageUrl("/static/x.png")).toBe("/static/x.png");
  });

  it("treats a bare filename as an upload", () => {
    expect(getImageUrl("unknown.png")).toBe(`${API_ORIGIN}/uploads/unknown.png`);
  });
});
