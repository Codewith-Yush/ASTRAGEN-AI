"use client";

import React, { useContext, useState } from "react";
import axios from "axios";
import {
  Loader2,
  Check,
  Sparkles,
  Zap,
  Lock,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";

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

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const FAQS = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time without questions or cancellation fees. You will retain full Pro benefits until your current billing cycle finishes.",
  },
  {
    question: "What AI models power Astragen?",
    answer:
      "Astragen uses cutting-edge Google Gemini models engineered for real-time streaming, high token throughput, structured markdown formatting, and fast response times.",
  },
  {
    question: "How does the monthly quota work?",
    answer:
      "The free tier includes 300,000 words per month, resetting monthly. Astragen Pro unlocks unlimited generations with high-priority streaming.",
  },
  {
    question: "Is my payment safe and secure?",
    answer:
      "Yes. All payment transactions are encrypted with 256-bit SSL encryption and processed through Razorpay, a PCI-DSS Level 1 compliant gateway.",
  },
];

function Billing() {
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useUser();
  const { userSubscription } = useContext(UserSubscriptionContext);

  const CreateSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/create-subscription", {});
      OnPayment(response.data.id);
    } catch (error) {
      console.error("Subscription creation failed:", error);
      alert("Unable to initiate subscription. Please verify Razorpay credentials.");
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
      alert("Payment gateway failed to load. Please check your internet connection.");
      setLoading(false);
      return;
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subId,
      name: "Astragen AI",
      description: "Pro Monthly Subscription",
      prefill: {
        name: user?.fullName || "Astragen Creator",
        email: user?.primaryEmailAddress?.emailAddress || "user@astragen.ai",
      },
      theme: {
        color: "#4F46E5",
      },
      handler: async (resp: any) => {
        try {
          if (resp?.razorpay_payment_id) {
            const verifyRes = await axios.post("/api/razorpay/verify", {
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_subscription_id: resp.razorpay_subscription_id,
              razorpay_signature: resp.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              window.location.reload();
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          }
        } catch (error) {
          console.error("Verification error:", error);
          alert("Payment verification failed. Please contact support.");
        } finally {
          setLoading(false);
        }
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

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Choose the plan that fits your ambition
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Start for free, or unlock high-speed unlimited generation with Astragen Pro.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Starter Plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Essential tools for individuals
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Default
              </span>
            </div>

            <div className="pt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                ₹0
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / forever
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/70 space-y-3">
              {[
                "300,000 Words per month",
                "Access to all 50+ AI templates",
                "Markdown and code syntax export",
                "History archive with search & view",
                "Voice Text-to-Speech playback",
                "Standard generation speed",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={true}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          >
            {userSubscription ? "Basic Tier" : "Current Plan"}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative bg-white dark:bg-[#0E131F] border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-indigo-500/10 space-y-6">
          {/* Popular Tag */}
          <div className="absolute -top-3.5 right-6">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-md shadow-indigo-500/30">
              Most Popular
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Astragen Pro</span>
                  <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full speed, maximum quota, zero limits
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                ₹99
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / month (billed monthly)
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/70 space-y-3">
              {[
                "Unlimited words & content quota",
                "High-speed priority Gemini streaming",
                "Full access to 50+ templates & future additions",
                "Unlimited content history with search & preview",
                "Instant Copy, Rich HTML & PDF export",
                "One-Click AI Polish & Refine tools",
                "Priority email & technical support",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={loading || Boolean(userSubscription)}
            onClick={CreateSubscription}
            className={`
              w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-[0.99]
              ${
                userSubscription
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with Razorpay...</span>
              </>
            ) : userSubscription ? (
              <span>✓ Pro Plan Active</span>
            ) : (
              <span>Upgrade to Pro Now</span>
            )}
          </button>
        </div>
      </div>

      {/* Security Reassurance */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2 text-center">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>End-to-end encrypted 256-bit checkout powered by Razorpay. Cancel anytime.</span>
      </div>

      {/* FAQ Section */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about Astragen subscriptions.
          </p>
        </div>

        <div className="space-y-2.5 max-w-2xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E131F] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Billing;
