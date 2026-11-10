import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";
import { db } from "@/utils/db";
import { UserSubscription } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid payment verification payload" }, { status: 400 });
    }

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = result.data;
    const secret = process.env.RAZORPAY_SECRET_KEY;

    if (!secret) {
      console.error("RAZORPAY_SECRET_KEY is not set.");
      return NextResponse.json({ error: "Payment verification service misconfigured" }, { status: 500 });
    }

    // Verify cryptographic signature with constant-time equality: payment_id + "|" + subscription_id
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    const genBuf = Buffer.from(generatedSignature, "utf8");
    const sigBuf = Buffer.from(razorpay_signature, "utf8");

    if (
      genBuf.length !== sigBuf.length ||
      !crypto.timingSafeEqual(genBuf, sigBuf)
    ) {
      console.warn("Invalid Razorpay signature attempt for email:", email);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Check if user record already exists
    const existing = await db
      .select()
      .from(UserSubscription)
      .where(eq(UserSubscription.email, email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(UserSubscription)
        .set({
          active: true,
          paymentId: razorpay_payment_id,
          razorpaySubscriptionId: razorpay_subscription_id,
          status: "active",
          userName: user?.fullName ?? existing[0].userName,
        })
        .where(eq(UserSubscription.email, email));
    } else {
      await db.insert(UserSubscription).values({
        email,
        userName: user?.fullName ?? "Valued Member",
        active: true,
        paymentId: razorpay_payment_id,
        razorpaySubscriptionId: razorpay_subscription_id,
        status: "active",
        joinDate: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription verified and activated successfully.",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}

