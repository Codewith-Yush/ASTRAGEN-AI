"use client";

import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import axios from "axios";
import { Loader2Icon, CheckCircleIcon, ShieldCheck, Clock, Download, Globe } from "lucide-react";
import { db } from "@/utils/db";
import { UserSubscription } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";

// Define Razorpay interface to fix the TypeScript error
interface RazorpayOptions {
  key: string | undefined;
  subscription_id: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
}

// Add Razorpay to Window interface
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

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

    const options: RazorpayOptions = {
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
      const joinDate = new Date();
      console.log("Raw joinDate:", joinDate);
      console.log("Type of joinDate:", typeof joinDate);

      if (!(joinDate instanceof Date)) {
        throw new Error("joinDate is not a Date object!");
      }

      console.log("ISO joinDate:", joinDate.toISOString());

      const result = await db.insert(UserSubscription).values({
        email: user?.primaryEmailAddress?.emailAddress ?? "",
        userName: user?.fullName ?? "Unknown User",
        active: true,
        paymentId: paymentId,
        joinDate: joinDate,
      });

      console.log("Subscription saved:", result);
      if (result) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Subscription save failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Upgrade Your <span className="text-indigo-600 dark:text-indigo-400">AI Experience</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Choose the plan that works best for your content creation needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center md:gap-10">
          {/* Free Plan Card */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm sm:px-8 lg:p-12 relative overflow-hidden hover:shadow-xl hover:scale-102 transition-all duration-300">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="free-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="1" height="1" fill="currentColor" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#free-pattern)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Free Plan</h2>
                <div className="h-1 w-12 bg-gray-200 dark:bg-gray-700 mx-auto mb-4 rounded-full"></div>
                <p className="mt-2 sm:mt-4 flex items-center justify-center">
                  <strong className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">$0</strong>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">10,000 Words/Month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">50+ Content Templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Unlimited Download & Copy</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">1 Month of History</span>
                </li>
              </ul>

              <div className="mt-8">
                <Button
                  disabled={true}
                  className="w-full rounded-xl py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-300"
                >
                  Current Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 border-2 border-indigo-500 p-6 shadow-lg sm:px-8 lg:p-12 relative overflow-hidden hover:shadow-xl hover:scale-102 transition-all duration-300">
            {/* Premium badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                PREMIUM
              </div>
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="premium-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#premium-pattern)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Premium Plan</h2>
                <div className="h-1 w-12 bg-indigo-500 mx-auto mb-4 rounded-full"></div>
                <p className="mt-2 sm:mt-4 flex items-center justify-center">
                  <strong className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 sm:text-5xl">$9.99</strong>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full p-1 bg-indigo-100 dark:bg-indigo-900">
                    <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300"><strong>100,000</strong> Words/Month</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full p-1 bg-indigo-100 dark:bg-indigo-900">
                    <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300"><strong>All</strong> Template Access</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full p-1 bg-indigo-100 dark:bg-indigo-900">
                    <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Unlimited</strong> Download & Copy</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full p-1 bg-indigo-100 dark:bg-indigo-900">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300"><strong>1 Year</strong> of History</span>
                </li>
              </ul>

              <div className="mt-8">
                <Button
                  disabled={loading || !!userSubscription}
                  onClick={CreateSubscription}
                  className="w-full rounded-xl py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
                >
                  {loading && <Loader2Icon className="animate-spin mr-2" />}
                  {userSubscription ? "Active Plan" : "Upgrade Now"}
                </Button>
              </div>
              
              {!userSubscription && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  Secure payment processing by Razorpay
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;