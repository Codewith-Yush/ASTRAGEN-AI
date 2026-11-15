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
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  LifeBuoy,
  PlaySquare,
  Globe,
} from "lucide-react";
import UsageTrack from "./UsageTrack";

const MENU_LIST = [
  { id: "home", name: "Studio", icon: LayoutGrid, path: "/dashboard" },
  { id: "history", name: "History", icon: Clock3, path: "/dashboard/history" },
  { id: "billing", name: "Billing", icon: CreditCard, path: "/dashboard/billing" },
  { id: "settings", name: "Settings", icon: Settings2, path: "/dashboard/settings" },
];

const QUICK_LINKS = [
  { id: "landing", name: "Overview", icon: Globe, path: "/" },
  { id: "demo", name: "Demo", icon: PlaySquare, path: "/demo" },
  { id: "help", name: "Support", icon: LifeBuoy, path: "/contact" },
];

interface SideNavProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const itemBase =
  "group relative flex h-8 items-center gap-2.5 rounded-[6px] px-2.5 text-[13px] transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-action/40";

/** Small mono section label */
const sectionLabel =
  "font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-dim";

function NavContent({
  pathname,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  pathname: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto p-2">
      <div className="space-y-5">
        {/* Brand */}
        <div
          className={`flex h-10 items-center ${
            collapsed ? "justify-center" : "justify-between pl-2.5 pr-1"
          }`}
        >
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={`flex min-w-0 items-center gap-2 ${collapsed ? "hidden" : ""}`}
            title="Astragen AI"
          >
            <span
              aria-hidden="true"
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] bg-ink font-mono text-[12px] font-bold leading-none text-canvas"
            >
              A
            </span>
            <span className="truncate text-[13px] font-semibold tracking-tight text-ink">
              Astragen
            </span>
            <span className="rounded-[4px] border border-border px-1 font-mono text-[9px] leading-[14px] text-ink-dim">
              AI
            </span>
          </Link>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-ink-dim transition-colors hover:bg-surface-elevated hover:text-ink md:flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>

        {/* Workspace */}
        <nav aria-label="Main" className="space-y-0.5">
          {!collapsed && (
            <div className="px-2.5 pb-1.5">
              <span className={sectionLabel}>Workspace</span>
            </div>
          )}

          {MENU_LIST.map((menu, i) => {
            const isActive =
              menu.path === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard/content")
                : pathname.startsWith(menu.path);
            const Icon = menu.icon;

            return (
              <Link
                key={menu.id}
                href={menu.path}
                onClick={onNavigate}
                title={collapsed ? menu.name : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`${itemBase} ${collapsed ? "justify-center px-0" : ""} ${
                  isActive
                    ? "bg-surface-elevated font-medium text-ink before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-[2px] before:rounded-full before:bg-ink"
                    : "text-ink-muted hover:bg-surface-elevated hover:text-ink"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-ink" : "text-ink-dim group-hover:text-ink"
                  }`}
                  strokeWidth={1.5}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{menu.name}</span>
                    <span className="font-mono text-[10px] tabular-nums text-ink-dim">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Resources */}
        <nav aria-label="Explore" className="space-y-0.5">
          {!collapsed && (
            <div className="px-2.5 pb-1.5">
              <span className={sectionLabel}>Resources</span>
            </div>
          )}

          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                href={link.path}
                onClick={onNavigate}
                title={collapsed ? link.name : undefined}
                className={`${itemBase} ${
                  collapsed ? "justify-center px-0" : ""
                } text-ink-muted hover:bg-surface-elevated hover:text-ink`}
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-ink-dim transition-colors group-hover:text-ink"
                  strokeWidth={1.5}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{link.name}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 -translate-x-0.5 translate-y-0.5 text-ink-dim opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-3 pb-1">
        <UsageTrack collapsed={collapsed} />
      </div>
    </div>
  );
}

function SideNav({
  mobileOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SideNavProps) {
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
      {/* Desktop sidebar (widths must match the md:pl-* offset in dashboard/layout.tsx) */}
      <aside
        aria-label="Sidebar"
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-surface transition-[width] duration-150 md:flex ${
          collapsed ? "w-14" : "w-[232px]"
        }`}
      >
        <NavContent
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-surface transition-transform duration-150 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-[6px] text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <NavContent pathname={pathname} onNavigate={onClose} />
      </aside>
    </>
  );
}

export default React.memo(SideNav);