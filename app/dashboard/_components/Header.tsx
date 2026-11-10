"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Crown, Moon, Sun, Sparkles, Menu } from "lucide-react";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

function Header({ onOpenMobileMenu }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { userSubscription } = useContext(UserSubscriptionContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 px-4 md:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md flex items-center justify-between transition-colors duration-200">
      {/* Left side: Mobile Hamburger + Brand / Desktop Status */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <Link href="/dashboard" className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            Astragen
          </span>
        </Link>

        {/* Desktop Active Engine Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini AI Engine Active</span>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pro Plan CTA / Badge */}
        {userSubscription ? (
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 fill-indigo-500 flex-shrink-0" />
            <span className="hidden sm:inline">Pro Plan</span>
            <span>Active</span>
          </div>
        ) : (
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:rotate-12 transition-transform flex-shrink-0" />
            <span>Upgrade</span>
            <span className="hidden sm:inline">to Pro</span>
          </Link>
        )}

        {/* Minimalist Theme Toggle */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}

        {/* User Profile */}
        <div className="pl-1 sm:pl-2 border-l border-slate-200/60 dark:border-slate-800/60">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 rounded-xl ring-2 ring-slate-200 dark:ring-slate-800 hover:ring-indigo-500 transition-all",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
