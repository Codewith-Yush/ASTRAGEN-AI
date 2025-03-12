"use client";

import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import axios from "axios";
import { Loader2Icon, CheckCircleIcon } from "lucide-react";
import { db } from "@/utils/db";
import { UserSubscription } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";

function Billing() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { userSubscription, setUserSubscription } = useContext(UserSubscriptionContext);

  const CreateSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/create-subscription", {});
      console.log(response.data);
      OnPayment(response.data.id);
    } catch (error) {
      console.error("Subscription creation failed:", error);
      setLoading(false);
    }
  };

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const OnPayment = async (subId: string) => {
    setLoading(true);
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay failed to load!");
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subId,
      name: "Tubeguruji AI Apps",
      description: "Monthly Subscription",
      prefill: {
        name: user?.fullName || "User",
        email: user?.primaryEmailAddress?.emailAddress || "email@example.com",
      },
      theme: {
        color: "#6366F1",
      },
      handler: async (resp: any) => {
        console.log(resp);
        if (resp) {
          SaveSubscription(resp?.razorpay_payment_id);
        }
        setLoading(false);
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Razorpay initialization failed:", e);
      setLoading(false);
    }
  };

  const SaveSubscription = async (paymentId: string) => {
    try {
      const result = await db.insert(UserSubscription).values({
        email: user?.primaryEmailAddress?.emailAddress,
        userName: user?.fullName,
        active: true,
        paymentId: paymentId,
        joinDate: moment().format("DD/MM/yyyy"),
      });
      console.log(result);
      if (result) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Subscription save failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h2 className="text-center font-bold text-3xl my-3 text-gray-800">Upgrade With Monthly Plan</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-center md:gap-8">
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm sm:px-8 lg:p-12 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">Free</h2>
              <p className="mt-2 sm:mt-4">
                <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">0$</strong>
                <span className="text-sm font-medium text-gray-700">/month</span>
              </p>
            </div>

            <ul className="mt-6 space-y-2">
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> 10,000 Words/Month</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> 50+ Content Templates</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> Unlimited Download & Copy</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> 1 Month of History</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm sm:px-8 lg:p-12 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">Monthly</h2>
              <p className="mt-2 sm:mt-4">
                <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">9.99$</strong>
                <span className="text-sm font-medium text-gray-700">/month</span>
              </p>
            </div>

            <ul className="mt-6 space-y-2">
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> 1,00,000 Words/Month</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> 50+ Template Access</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> Unlimited Download & Copy</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="text-green-500" /> 1 Year of History</li>
            </ul>

            <Button
              disabled={loading}
              onClick={CreateSubscription}
              className="w-full rounded-full mt-5 p-6 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
            >
              {loading && <Loader2Icon className="animate-spin mr-2" />}
              {userSubscription ? "Active Plan" : "Get Started"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;