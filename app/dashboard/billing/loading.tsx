import React from "react";

export default function BillingLoading() {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-2">
        <div className="h-5 w-28 mx-auto bg-surface-elevated rounded-full" />
        <div className="h-8 w-64 mx-auto bg-surface-elevated rounded-xl" />
        <div className="h-4 w-80 mx-auto bg-surface-elevated rounded-lg" />
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-8 bg-surface border border-border rounded-2xl shadow-xs space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-surface-elevated rounded-md" />
                <div className="h-8 w-20 bg-surface-elevated rounded-lg" />
              </div>
              <div className="h-6 w-16 bg-surface-elevated rounded-full" />
            </div>
            <div className="space-y-2.5 pt-4 border-t border-border">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 w-full bg-surface-elevated rounded-md" />
              ))}
            </div>
            <div className="h-10 w-full bg-surface-elevated rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
