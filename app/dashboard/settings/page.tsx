import { UserProfile } from "@clerk/nextjs";
import React from "react";

function Settings() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your personal profile, connected accounts, credentials, and authentication preferences.
        </p>
      </div>

      <div className="flex justify-center items-center py-2 sm:py-4 overflow-x-auto">
        <div className="w-full flex justify-center">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                card: "shadow-xs border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl bg-white dark:bg-[#121418] w-full max-w-3xl",
                navbar: "border-r border-neutral-200/80 dark:border-neutral-800/80",
                headerTitle: "text-neutral-900 dark:text-white font-semibold text-base",
                headerSubtitle: "text-neutral-500 dark:text-neutral-400 text-xs",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
