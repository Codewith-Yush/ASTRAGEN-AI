"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Crown, Moon, Sun, Sparkles, Menu, Search, Zap } from "lucide-react";
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

  const triggerGlobalSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <header className="sticky top-0 z-30 h-16 px-4 md:px-8 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-[#07080B]/75 backdrop-blur-xl flex items-center justify-between transition-colors duration-200">
      {/* Left Side: Mobile Hamburger + Brand / Desktop Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors bg-white/60 dark:bg-slate-900/60"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <Link href="/dashboard" className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            Astragen
          </span>
        </Link>

        {/* Desktop Active Engine Badge */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Gemini 2.0 Flash</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Ultra-Speed
          </span>
        </div>
      </div>

      {/* Center Search Pill for quick command */}
      <div className="hidden lg:flex items-center">
        <button
          type="button"
          onClick={triggerGlobalSearch}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/70 hover:bg-slate-200/60 dark:bg-slate-900/50 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 transition-all cursor-pointer shadow-2xs group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          <span>Quick find engine...</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pro Plan CTA / Badge */}
        {userSubscription ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-semibold shadow-2xs">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
            <span>Pro Active</span>
          </div>
        ) : (
          <Link
            href="/dashboard/billing"
            className="relative group overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-sm hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="relative z-10">Upgrade</span>
            <span className="relative z-10 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-white/20 backdrop-blur-xs">
              Pro
            </span>
          </Link>
        )}

        {/* Theme Toggle Button */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all duration-150 shadow-2xs"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}

        {/* User Profile */}
        <div className="pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-105 transition-transform",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);
