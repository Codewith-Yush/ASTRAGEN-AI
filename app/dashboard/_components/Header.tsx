"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Search, ChevronRight } from "lucide-react";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const SECTION_NAMES: Record<string, string> = {
  history: "History",
  billing: "Billing",
  settings: "Settings",
};

const titleFromSlug = (slug: string) =>
  decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Builds breadcrumb segments from the current dashboard path */
function useCrumbs(pathname: string) {
  return useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [
      { label: "Studio", href: "/dashboard" },
    ];
    const parts = pathname.split("/").filter(Boolean); // ["dashboard", ...]
    const rest = parts.slice(1);

    if (rest[0] === "content" && rest[1]) {
      crumbs.push({ label: titleFromSlug(rest[1]) });
    } else if (rest[0] && SECTION_NAMES[rest[0]]) {
      crumbs.push({ label: SECTION_NAMES[rest[0]] });
    }

    // Last crumb is the current page, so it is not a link
    const last = crumbs.length - 1;
    return crumbs.map((c, i) => (i === last ? { label: c.label } : c));
  }, [pathname]);
}

function Header({ onOpenMobileMenu }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { userSubscription } = useContext(UserSubscriptionContext);
  const pathname = usePathname();
  const crumbs = useCrumbs(pathname);

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

  const iconBtn =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink";

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-3 border-b border-border bg-canvas/90 px-3 backdrop-blur-md md:px-5">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex min-w-0 items-center gap-2">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className={`${iconBtn} md:hidden`}
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center text-[13px]">
          {crumbs.map((c, i) => (
            <React.Fragment key={`${c.label}-${i}`}>
              {i > 0 && (
                <ChevronRight
                  className="mx-1 h-3.5 w-3.5 shrink-0 text-ink-dim"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
              {c.href ? (
                <Link
                  href={c.href}
                  className="truncate text-ink-muted transition-colors hover:text-ink"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ink" aria-current="page">
                  {c.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: search, plan, theme, user */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={triggerGlobalSearch}
          aria-label="Search templates"
          className="hidden h-7 w-56 cursor-pointer items-center gap-2 rounded-[6px] border border-border bg-surface px-2 text-[12px] text-ink-dim transition-colors hover:border-border-subtle hover:text-ink-muted sm:flex"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="flex-1 text-left">Search templates</span>
          <kbd className="rounded-[4px] border border-border px-1 font-mono text-[10px] leading-4 text-ink-dim">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={triggerGlobalSearch}
          aria-label="Search templates"
          className={`${iconBtn} sm:hidden`}
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {userSubscription ? (
          <span className="hidden h-7 items-center rounded-[6px] border border-border px-2 text-[12px] text-ink-muted sm:inline-flex">
            Pro
          </span>
        ) : (
          <Link
            href="/dashboard/billing"
            className="hidden h-7 items-center rounded-[6px] border border-border px-2.5 text-[12px] text-ink transition-colors hover:border-border-subtle hover:bg-surface-elevated sm:inline-flex"
          >
            Upgrade
          </Link>
        )}

        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle color theme"
            className={iconBtn}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )}

        <div className="ml-1 flex items-center border-l border-border pl-2.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-6 h-6 rounded-full",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);