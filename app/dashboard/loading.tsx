import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      // Short delay before showing, so fast navigations don't flash a spinner.
      className="flex min-h-[50vh] flex-col items-center justify-center space-y-3 animate-in fade-in duration-300 [animation-delay:150ms] [animation-fill-mode:backwards]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 shadow-xs dark:bg-neutral-800 dark:text-neutral-300">
        <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      </div>
      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
        Loading workspace...
      </p>
    </div>
  );
}