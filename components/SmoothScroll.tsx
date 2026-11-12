"use client";

import { useEffect } from "react";

/**
 * Dependency-free inertia scrolling (lerp-based).
 * - Skips touch devices & prefers-reduced-motion (native scroll is already great there)
 * - Leaves nested scrollable areas alone
 * - Intercepts #anchor links and glides to them
 * Put <SmoothScroll /> once, anywhere inside the page (or in layout.tsx).
 */
export default function SmoothScroll({ ease = 0.085 }: { ease?: number }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let raf = 0;
    let running = false;

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const tick = () => {
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        window.scrollTo({ top: current, behavior: "instant" as ScrollBehavior });
        running = false;
        return;
      }
      window.scrollTo({ top: current, behavior: "instant" as ScrollBehavior });
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return;

      let el = e.target as HTMLElement | null;
      while (el && el !== document.body && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight) {
          const overflow = el.style.overflowY || getComputedStyle(el).overflowY;
          if (overflow === "auto" || overflow === "scroll") return;
        }
        el = el.parentElement;
      }

      e.preventDefault();
      if (!running) {
        current = window.scrollY;
        target = window.scrollY;
      }
      const delta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      target = Math.max(0, Math.min(maxScroll(), target + delta));
      start();
    };

    // keep in sync when the user scrolls by keyboard / scrollbar drag
    const onScroll = () => {
      if (!running) {
        current = window.scrollY;
        target = window.scrollY;
      }
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const node = id ? document.getElementById(id) : null;
      if (!node) return;
      e.preventDefault();
      current = window.scrollY;
      target = Math.max(
        0,
        Math.min(maxScroll(), node.getBoundingClientRect().top + window.scrollY - 100)
      );
      start();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, [ease]);

  return null;
}