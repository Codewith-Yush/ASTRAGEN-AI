"use client";

import React, { useEffect, useRef } from "react";

/**
 * Decorative hero background. Place it as the first child of a
 * `relative isolate` wrapper; keep real content in `relative z-10`.
 * Pointer position drives the spotlight + highlighted grid (desktop only).
 */
function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      el.dataset.active = "true";
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.dataset.active = "false";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="hero-fx" aria-hidden="true" data-active="false">
      <div className="hero-fx__glow" />
      <div className="hero-fx__glow hero-fx__glow--2" />
      <div className="hero-fx__rings" />
      <div className="hero-fx__dots" />
      <div className="hero-fx__dots-hot" />
      <div className="hero-fx__spot" />
      <div className="hero-fx__beam" />
      <div className="hero-fx__noise" />
      <div className="hero-fx__fade" />
    </div>
  );
}

export default React.memo(HeroBackdrop);