import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
    try {
        const body = await req.json(); // Parse request body

        // ✅ Environment variables check
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
            throw new Error("Razorpay API keys are missing in environment variables.");
        }

        // ✅ Razorpay instance
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET_KEY,
        });

        // ✅ Subscription creation
        const result = await instance.subscriptions.create({
            plan_id: process.env.SUBSCRIPTION_PLAN_ID,
            customer_notify: 1,
            quantity: 1,
            total_count: 1,
            addons: [],
            notes: { key1: "Note" },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Razorpay Error:", error);
        return NextResponse.json(
            { error: error.message || "Subscription creation failed." }, 
            { status: 500 }
        );
    }
}
