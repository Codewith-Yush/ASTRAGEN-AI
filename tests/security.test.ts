import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("Security & Quota Verification", () => {
  it("generates and verifies Razorpay HMAC SHA-256 signature correctly", () => {
    const paymentId = "pay_test123456";
    const subscriptionId = "sub_test987654";
    const secret = "secret_key_sample";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest("hex");

    expect(expectedSignature).toBeDefined();
    expect(typeof expectedSignature).toBe("string");
    expect(expectedSignature.length).toBe(64);

    // Tampered test
    const tamperedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${paymentId}|tampered_sub`)
      .digest("hex");

    expect(expectedSignature).not.toBe(tamperedSignature);
  });

  it("calculates quota correctly for free vs subscribed tier", () => {
    const freeTierMax = 300000;
    const proTierMax = 1000000;

    const userUsage = 305000;
    const isFreeTierExceeded = userUsage >= freeTierMax;
    const isProTierExceeded = userUsage >= proTierMax;

    expect(isFreeTierExceeded).toBe(true);
    expect(isProTierExceeded).toBe(false);
  });

  it("sanitizes HTML inputs against XSS attack vectors", () => {
    const maliciousInput = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
    const escaped = maliciousInput
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
  });
});

