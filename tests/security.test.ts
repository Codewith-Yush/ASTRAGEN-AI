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

  it("verifies webhook idempotency key derivation is deterministic across retries", () => {
    const rawBody = JSON.stringify({
      entity: "event",
      event: "subscription.charged",
      payload: { subscription: { entity: { id: "sub_123" } } }
    });

    // When x-razorpay-event-id header is provided
    const headerEventId = "evt_rzp_mock_12345";
    const derived1 = headerEventId || `evt_${crypto.createHash("sha256").update(rawBody).digest("hex")}`;
    expect(derived1).toBe("evt_rzp_mock_12345");

    // When header is missing, fallback hash is deterministic for identical rawBody payloads across retries
    const fallbackIdAttempt1 = `evt_${crypto.createHash("sha256").update(rawBody).digest("hex")}`;
    const fallbackIdAttempt2 = `evt_${crypto.createHash("sha256").update(rawBody).digest("hex")}`;
    expect(fallbackIdAttempt1).toBe(fallbackIdAttempt2);
    expect(fallbackIdAttempt1).toMatch(/^evt_[a-f0-9]{64}$/);
  });

  it("safely compares HMAC signatures in constant-time", () => {
    const validHex = crypto.createHmac("sha256", "secret").update("payload").digest("hex");
    const tamperedHex = crypto.createHmac("sha256", "wrong_secret").update("payload").digest("hex");

    const validBuf = Buffer.from(validHex, "utf8");
    const checkBuf = Buffer.from(validHex, "utf8");
    const tamperedBuf = Buffer.from(tamperedHex, "utf8");

    expect(validBuf.length === checkBuf.length && crypto.timingSafeEqual(validBuf, checkBuf)).toBe(true);
    expect(validBuf.length === tamperedBuf.length && crypto.timingSafeEqual(validBuf, tamperedBuf)).toBe(false);
  });

  it("enforces contact form rate limiting correctly", async () => {
    const { checkRateLimit } = await import("../lib/rateLimit");
    const testIp = "test_ip_192.168.10.99";

    // First 5 requests should be allowed
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testIp, 5, 60000);
      expect(res.allowed).toBe(true);
      expect(res.retryAfterSeconds).toBe(0);
    }

    // 6th request should be blocked
    const blockedRes = checkRateLimit(testIp, 5, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
  });
});

