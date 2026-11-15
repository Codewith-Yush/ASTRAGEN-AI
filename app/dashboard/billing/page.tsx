"use client";

import React, { useContext, useState } from "react";
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
      "The free tier includes 100 credits per month, resetting monthly. Astragen Pro unlocks unlimited generations with high-priority streaming.",
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
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useUser();
  const { userSubscription } = useContext(UserSubscriptionContext);

  const CreateSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create subscription");
      const data = await res.json();
      OnPayment(data.id);
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
      description: "Pro Subscription",
      prefill: {
        name: user?.fullName || "Astragen Creator",
        email: user?.primaryEmailAddress?.emailAddress || "user@astragen.ai",
      },
      theme: {
        color: "#9333EA",
      },
      handler: async (resp: any) => {
        try {
          if (resp?.razorpay_payment_id) {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_subscription_id: resp.razorpay_subscription_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData?.success) {
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
    <div className="max-w-4xl mx-auto py-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 px-2">
        <span className="text-label text-accent-cyan tracking-widest inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" strokeWidth={1.5} />
          <span>Membership</span>
        </span>
        <h1 className="text-page-title text-ink font-semibold tracking-tight">
          Simple, transparent plans
        </h1>
        <p className="text-body-small text-ink-muted max-w-md mx-auto">
          Start for free, or upgrade to Astragen Pro for unlimited, high-throughput generation.
        </p>

        {/* Monthly / Annual Toggle Switch */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className={`text-xs font-medium ${!isAnnual ? "text-ink font-semibold" : "text-ink-muted"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isAnnual}
            aria-label="Toggle annual billing"
            onClick={() => setIsAnnual((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-action ${
              isAnnual ? "bg-action" : "bg-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isAnnual ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-xs font-medium flex items-center gap-1.5 ${isAnnual ? "text-ink font-semibold" : "text-ink-muted"}`}>
            <span>Annual</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-surface-elevated text-accent-cyan border border-border">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid (Side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-ink">
                  Starter
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Free forever
                </p>
              </div>
              <span className="text-label px-2.5 py-0.5 rounded-full bg-surface-elevated text-ink-muted border border-border">
                Default
              </span>
            </div>

            <div className="pt-1 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-ink">
                ₹0
              </span>
              <span className="text-xs text-ink-muted">
                / forever
              </span>
            </div>

            <div className="pt-4 border-t border-border space-y-2.5">
              {[
                "100 AI credits per month",
                "Access to all 30+ prompt engines",
                "Markdown and code syntax export",
                "History archive with search & view",
                "Voice Text-to-Speech playback",
                "Standard streaming speed",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-ink-muted">
                  <Check className="w-4 h-4 text-ink-dim flex-shrink-0" strokeWidth={1.5} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={true}
            className="w-full py-2.5 px-4 rounded-full text-xs font-medium bg-surface-elevated border border-border text-ink-dim cursor-not-allowed text-center"
          >
            {userSubscription ? "Basic Tier" : "Current Plan"}
          </button>
        </div>

        {/* Pro Plan (with 1px action border) */}
        <div className="relative bg-surface border border-action rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs">
          {/* Eyebrow badge */}
          <div className="absolute -top-3 right-6">
            <span className="px-3 py-0.5 rounded-full bg-action text-action-ink text-[10px] font-medium tracking-wider uppercase shadow-xs">
              Recommended
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-ink flex items-center gap-1.5">
                  <span>Astragen Pro</span>
                  <Zap className="w-4 h-4 text-action" strokeWidth={1.5} />
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Unlimited high-speed generation
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-ink">
                {isAnnual ? "₹79" : "₹99"}
              </span>
              <span className="text-xs text-ink-muted">
                / month {isAnnual ? "(billed annually)" : "(billed monthly)"}
              </span>
            </div>

            <div className="pt-4 border-t border-border space-y-2.5">
              {[
                "Unlimited credits & generation quota",
                "High-speed priority Gemini streaming",
                "Full access to 30+ templates & future engines",
                "Unlimited content history with search & re-run",
                "Instant Copy, Rich HTML & PDF export",
                "One-Click AI Polish & Refine tools",
                "Priority technical support",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-ink">
                  <div className="w-4 h-4 rounded-full bg-surface-elevated border border-border text-action flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-action" strokeWidth={1.5} />
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
              w-full py-3 px-6 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer
              ${
                userSubscription
                  ? "bg-surface-elevated text-accent-cyan border border-border"
                  : "bg-action text-action-ink hover:bg-action-hover shadow-xs"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-current" />
                <span>Processing with Razorpay…</span>
              </>
            ) : userSubscription ? (
              <span>✓ Pro Plan Active</span>
            ) : (
              <span>Upgrade to Pro — {isAnnual ? "₹79/mo" : "₹99/mo"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Security Reassurance */}
      <div className="flex items-center justify-center gap-2 text-xs text-ink-dim pt-2 text-center">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
        <span>256-bit encrypted checkout powered by Razorpay. Cancel anytime.</span>
      </div>

      {/* FAQ Section */}
      <div className="pt-6 border-t border-border space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-section-title font-semibold text-ink flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-ink-muted">
            Details about Astragen billing and subscriptions.
          </p>
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-ink hover:text-action transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-ink-muted leading-relaxed border-t border-border pt-2.5">
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
