import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        Loading dashboard...
      </p>
    </div>
  );
}
