import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/utils/db";
import { UserSubscription, WebhookEvents } from "@/utils/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    // Verify HMAC SHA-256 signature with constant-time equality check
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    // Idempotency: prioritize standard x-razorpay-event-id header, payload event id, or deterministic hash of rawBody
    const headerEventId = req.headers.get("x-razorpay-event-id");
    const eventId =
      headerEventId ||
      event?.id ||
      event?.event_id ||
      `evt_${crypto.createHash("sha256").update(rawBody).digest("hex")}`;

    // Idempotency check: has this event already been processed?
    const existingEvent = await db
      .select()
      .from(WebhookEvents)
      .where(eq(WebhookEvents.eventId, eventId))
      .limit(1);

    if (existingEvent.length > 0) {
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    const eventType = event.event;
    const subscriptionPayload = event.payload?.subscription?.entity;
    const paymentPayload = event.payload?.payment?.entity;

    const subId = subscriptionPayload?.id;
    const customerEmail = subscriptionPayload?.customer_email || paymentPayload?.email;

    if (eventType === "subscription.charged" || eventType === "subscription.activated") {
      if (subId) {
        await db
          .update(UserSubscription)
          .set({
            active: true,
            status: "active",
            currentPeriodEnd: subscriptionPayload?.current_end
              ? new Date(subscriptionPayload.current_end * 1000)
              : undefined,
          })
          .where(eq(UserSubscription.razorpaySubscriptionId, subId));
      }
    } else if (eventType === "subscription.cancelled" || eventType === "subscription.halted") {
      if (subId) {
        await db
          .update(UserSubscription)
          .set({
            active: false,
            status: "cancelled",
          })
          .where(eq(UserSubscription.razorpaySubscriptionId, subId));
      }
    }

    // Record processed event
    await db.insert(WebhookEvents).values({
      eventId,
      eventType,
      processedAt: new Date(),
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing failed" }, { status: 500 });
  }
}

