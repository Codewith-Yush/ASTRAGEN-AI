import { UserProfile } from "@clerk/nextjs";
import React from "react";

function Settings() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, connected accounts, credentials, and authentication preferences.
        </p>
      </div>

      <div className="flex justify-center items-center py-2 sm:py-4 overflow-x-auto">
        <div className="w-full flex justify-center">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                card: "shadow-sm border border-slate-200/80 dark:border-slate-800/80 rounded-3xl bg-white dark:bg-[#0E131F] w-full max-w-3xl",
                navbar: "border-r border-slate-200/80 dark:border-slate-800/80",
                headerTitle: "text-slate-900 dark:text-white font-bold",
                headerSubtitle: "text-slate-500 dark:text-slate-400",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
