"use client";

import React, { useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Zap, Crown, ArrowRight } from "lucide-react";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";

function UsageTrack() {
  const { user, isLoaded } = useUser();
  const { totalUsage, setTotalUsage } = useContext(TotalUsageContext);
  const { userSubscription, setUserSubscription } = useContext(UserSubscriptionContext);
  const [maxWords, setMaxWords] = useState<number>(300000);
  const { updateCreditUsage } = useContext(UpdateCreditUsageContext);

  const fetchUsageData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/user/usage");
      if (response.ok) {
        const data = await response.json();
        setTotalUsage(data.totalUsage ?? 0);
        setMaxWords(data.maxWords ?? 300000);
        setUserSubscription(Boolean(data.isSubscribed));
      }
    } catch (error) {
      console.error("Failed to load usage stats:", error);
    }
  }, [user, setTotalUsage, setUserSubscription]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUsageData();
    }
  }, [isLoaded, user, updateCreditUsage, fetchUsageData]);

  const usagePercent = Math.min(100, Math.round((Number(totalUsage) / maxWords) * 100));

  return (
    <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
            Monthly Quota
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            userSubscription
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
              : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {userSubscription ? "Unlimited" : "Free Tier"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>{Number(totalUsage).toLocaleString()} used</span>
          <span>{usagePercent}%</span>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!userSubscription && (
        <Link
          href="/dashboard/billing"
          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm group"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default UsageTrack;
