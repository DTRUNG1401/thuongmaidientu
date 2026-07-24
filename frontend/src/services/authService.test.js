import { describe, it, expect, beforeEach, vi } from "vitest";

const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("./api", () => ({ default: api }));

import { login, register, registerSeller } from "./authService";
import { sendMessage } from "./chatbotService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authService", () => {
  it("login posts credentials", async () => {
    api.post.mockResolvedValue({ data: { token: "t" } });
    await login({ email: "a@b.com", password: "pw" });
    expect(api.post).toHaveBeenCalledWith("/login", { email: "a@b.com", password: "pw" });
  });

  it("register posts to the register endpoint", async () => {
    api.post.mockResolvedValue({ data: {} });
    await register({ email: "a@b.com" });
    expect(api.post).toHaveBeenCalledWith("/register", { email: "a@b.com" });
  });

  it("registerSeller posts to the seller endpoint", async () => {
    api.post.mockResolvedValue({ data: {} });
    await registerSeller({ shop_name: "Shop" });
    expect(api.post).toHaveBeenCalledWith("/seller/register", { shop_name: "Shop" });
  });
});

describe("chatbotService", () => {
  it("sendMessage posts the message", async () => {
    api.post.mockResolvedValue({ data: { reply: "hi" } });
    await sendMessage("tai nghe");
    expect(api.post).toHaveBeenCalledWith("/chatbot/message", { message: "tai nghe" });
  });
});
