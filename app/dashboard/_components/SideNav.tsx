"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Clock3,
  CreditCard,
  Settings2,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import UsageTrack from "./UsageTrack";

const MENU_LIST = [
  {
    id: "home",
    name: "Dashboard",
    icon: LayoutGrid,
    path: "/dashboard",
  },
  {
    id: "history",
    name: "History",
    icon: Clock3,
    path: "/dashboard/history",
  },
  {
    id: "billing",
    name: "Billing",
    icon: CreditCard,
    path: "/dashboard/billing",
  },
  {
    id: "settings",
    name: "Settings",
    icon: Settings2,
    path: "/dashboard/settings",
  },
];

interface SideNavProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function SideNav({ mobileOpen = false, onClose }: SideNavProps) {
  const pathname = usePathname();

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onClose]);

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full justify-between p-5">
      {/* Brand & Menu */}
      <div className="space-y-6">
        {/* Brand */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2 py-1 group transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Astragen
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Content Studio
            </p>
          </div>
        </Link>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Navigation
          </p>
          {MENU_LIST.map((menu) => {
            const isActive =
              menu.path === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(menu.path);
            const Icon = menu.icon;

            return (
              <Link
                key={menu.id}
                href={menu.path}
                onClick={onNavigate}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]
                  ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="pt-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Explore
          </p>
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span>Landing Page</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span>Help & Contact</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>
      </div>

      {/* Footer / Usage tracker */}
      <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
        <UsageTrack />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#0E131F] border-r border-slate-200/80 dark:border-slate-800/80 z-40 transition-colors duration-200">
        <NavContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={`
          md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0E131F] border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavContent onNavigate={onClose} />
      </aside>
    </>
  );
}

export default SideNav;
