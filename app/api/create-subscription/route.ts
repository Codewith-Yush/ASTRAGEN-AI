import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
      throw new Error("Razorpay API credentials missing in environment variables.");
    }

    const planId = process.env.SUBSCRIPTION_PLAN_ID;
    if (!planId) {
      throw new Error("SUBSCRIPTION_PLAN_ID is not configured.");
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const result = await instance.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 billing cycles (1 year)
      addons: [],
      notes: {
        userId: user.id,
        userEmail: email,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Razorpay subscription creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Subscription creation failed." },
      { status: 500 }
    );
  }
}

