"use client";

import React, { useEffect, useRef } from "react";
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
  LifeBuoy,
  Globe,
  PlaySquare,
  Flame,
} from "lucide-react";
import UsageTrack from "./UsageTrack";

const MENU_LIST = [
  { id: "home", name: "Studio Home", icon: LayoutGrid, path: "/dashboard", badge: "Live" },
  { id: "history", name: "Content History", icon: Clock3, path: "/dashboard/history" },
  { id: "billing", name: "Subscription", icon: CreditCard, path: "/dashboard/billing", badge: "Upgrade" },
  { id: "settings", name: "Settings", icon: Settings2, path: "/dashboard/settings" },
];

const QUICK_LINKS = [
  { id: "landing", name: "Landing Showcase", icon: Globe, path: "/" },
  { id: "demo", name: "Interactive Demo", icon: PlaySquare, path: "/demo" },
  { id: "help", name: "Help & Support", icon: LifeBuoy, path: "/contact" },
];

interface SideNavProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Brand */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-3 px-2 py-1.5 transition-all"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#07080B]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Astragen
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Next-Gen Content Studio</span>
            </p>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav aria-label="Main" className="space-y-1">
          <div className="px-2.5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace
            </span>
          </div>

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
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-transparent dark:from-indigo-500/20 dark:via-blue-500/10 dark:to-transparent text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs border-l-[3px] border-indigo-600 dark:border-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="truncate">{menu.name}</span>
                </div>

                {menu.badge && !isActive && menu.id === "billing" && (
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {menu.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Links */}
        <nav aria-label="Explore" className="space-y-1 pt-1">
          <div className="px-2.5 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Resources & Suite
            </span>
          </div>

          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                href={link.path}
                onClick={onNavigate}
                className="group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                  <span>{link.name}</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Usage Tracker Widget */}
      <div className="mt-6 pt-2">
        <UsageTrack />
      </div>
    </div>
  );
}

function SideNav({ mobileOpen = false, onClose }: SideNavProps) {
  const pathname = usePathname();

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onCloseRef.current?.();
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Sidebar"
        className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#07080B]/85 backdrop-blur-xl transition-colors duration-200 md:flex"
      >
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#07080B]/95 backdrop-blur-2xl shadow-2xl transition-transform duration-200 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute right-3.5 top-3.5 z-10 w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors bg-white/80 dark:bg-slate-900/80"
        >
          <X className="h-4 w-4" />
        </button>
        <NavContent pathname={pathname} onNavigate={onClose} />
      </aside>
    </>
  );
}

export default React.memo(SideNav);
