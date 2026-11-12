import React from "react";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-4 w-72 bg-neutral-100 dark:bg-neutral-800/60 rounded-md" />
      </div>

      <div className="h-[460px] w-full bg-white dark:bg-[#121418] border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-xs p-8 flex flex-col justify-center items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-3.5 w-56 bg-neutral-100 dark:bg-neutral-800/60 rounded" />
      </div>
    </div>
  );
}
