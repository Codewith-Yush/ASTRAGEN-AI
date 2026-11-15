"use client";

import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";

interface UsageTrackProps {
  collapsed?: boolean;
}

function UsageTrack({ collapsed = false }: UsageTrackProps) {
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

  // Percentage of the free word allowance used
  const usedPercent = Math.min(100, Math.round((Number(totalUsage) / maxWords) * 100));
  const percent = userSubscription ? 100 : usedPercent;

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center gap-1 py-1.5 text-ink-muted"
        title={userSubscription ? "Unlimited usage" : `${usedPercent}% of free usage`}
      >
        <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span className="text-[10px] font-mono tabular-nums">
          {userSubscription ? "∞" : `${usedPercent}%`}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim">Usage</span>
        <span className="font-mono tabular-nums text-ink">
          {userSubscription ? (
            "Unlimited"
          ) : (
            <>
              {usedPercent}
              <span className="text-ink-dim">%</span>
            </>
          )}
        </span>
      </div>

      {/* 20-segment meter */}
      <div
        className="flex h-2 items-stretch gap-[2px]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Usage"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className={`flex-1 rounded-[1px] transition-colors duration-300 ${
              i < Math.round(percent / 5) ? "bg-ink" : "bg-border"
            }`}
          />
        ))}
      </div>

      {!userSubscription && (
        <Link
          href="/dashboard/billing"
          className="inline-block text-[11px] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Upgrade plan
        </Link>
      )}
    </div>
  );
}

export default React.memo(UsageTrack);