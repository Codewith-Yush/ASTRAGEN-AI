"use client";

import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Zap, ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";

function UsageTrack() {
  const { user, isLoaded } = useUser();
  const { totalUsage, setTotalUsage } = useContext(TotalUsageContext);
  const { userSubscription, setUserSubscription } = useContext(UserSubscriptionContext);
  const [maxWords, setMaxWords] = useState<number>(300000);
  const { updateCreditUsage } = useContext(UpdateCreditUsageContext);

  const isFetchingRef = useRef(false);
  const lastFetchedUserRef = useRef<string | null>(null);
  const lastUpdateRef = useRef<any>(null);

  const userId = user?.id;

  const fetchUsageData = useCallback(async () => {
    if (!userId || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const response = await fetch("/api/user/usage");
      if (response.ok) {
        const data = await response.json();
        const newTotal = Number(data.totalUsage ?? 0);
        const newMax = Number(data.maxWords ?? 300000);
        const newSub = Boolean(data.isSubscribed);

        setTotalUsage((prev: number) => (prev !== newTotal ? newTotal : prev));
        setMaxWords((prev) => (prev !== newMax ? newMax : prev));
        setUserSubscription((prev: boolean) => (prev !== newSub ? newSub : prev));
        lastFetchedUserRef.current = userId;
      }
    } catch (error) {
      console.error("Failed to load usage stats:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [userId, setTotalUsage, setUserSubscription]);

  useEffect(() => {
    if (isLoaded && userId) {
      const isNewUser = lastFetchedUserRef.current !== userId;
      const isNewUpdate = Boolean(updateCreditUsage && updateCreditUsage !== lastUpdateRef.current);
      if (isNewUser || isNewUpdate) {
        lastUpdateRef.current = updateCreditUsage;
        fetchUsageData();
      }
    }
  }, [isLoaded, userId, updateCreditUsage, fetchUsageData]);

  const usagePercent = Math.min(100, Math.round((Number(totalUsage) / maxWords) * 100));
  const isNearLimit = usagePercent >= 85;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/30 dark:from-slate-900/90 dark:via-[#0B0D14] dark:to-indigo-950/20 p-4 shadow-sm space-y-3">
      {/* Background ambient light */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <div className="w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Zap className="w-3 h-3 fill-current" />
          </div>
          <span>AI Credits</span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            userSubscription
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : isNearLimit
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              : "bg-slate-200/60 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          {userSubscription ? "Unlimited" : `${usagePercent}% Used`}
        </span>
      </div>

      {/* High-tech Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              userSubscription
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : isNearLimit
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
            }`}
            style={{ width: `${userSubscription ? 100 : usagePercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {userSubscription ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Unlimited Active
            </span>
          ) : (
            <>
              <span>{Number(totalUsage).toLocaleString()} words</span>
              <span>{maxWords.toLocaleString()} max</span>
            </>
          )}
        </div>
      </div>

      {/* Upgrade CTA */}
      {!userSubscription && (
        <Link
          href="/dashboard/billing"
          className="group relative z-10 flex items-center justify-between pt-1.5 mt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Get Unlimited Pro
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default React.memo(UsageTrack);
