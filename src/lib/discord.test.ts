import { describe, it, expect } from "vitest";
import { isValidWebhookUrl, hexToInt, maskWebhookUrl, remainingChars } from "./discord";

// @kliv-spec-derived — from user intent: only real Discord webhook URLs may be sent to
describe("isValidWebhookUrl", () => {
  it("accepts a standard discord webhook url", () => {
    expect(isValidWebhookUrl("https://discord.com/api/webhooks/123456789/abcDEF-_123")).toBe(true);
  });

  it("accepts the discordapp.com and canary variants", () => {
    expect(isValidWebhookUrl("https://discordapp.com/api/webhooks/1/tok")).toBe(true);
    expect(isValidWebhookUrl("https://canary.discord.com/api/webhooks/1/tok")).toBe(true);
  });

  it("rejects non-discord or malformed urls", () => {
    expect(isValidWebhookUrl("https://evil.com/api/webhooks/1/tok")).toBe(false);
    expect(isValidWebhookUrl("http://discord.com/api/webhooks/1/tok")).toBe(false);
    expect(isValidWebhookUrl("")).toBe(false);
  });
});

describe("hexToInt", () => {
  it("converts blurple", () => {
    expect(hexToInt("#5865F2")).toBe(5793266);
  });
  it("returns undefined for junk", () => {
    expect(hexToInt("nope")).toBeUndefined();
  });
});

describe("maskWebhookUrl", () => {
  it("hides most of the token", () => {
    const masked = maskWebhookUrl("https://discord.com/api/webhooks/123/supersecrettoken");
    expect(masked).toContain("123");
    expect(masked).not.toContain("supersecrettoken");
  });
});

describe("remainingChars", () => {
  it("counts down from 2000", () => {
    expect(remainingChars("hello")).toBe(1995);
  });
});
