"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Use Cases", href: "#use-cases" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Developers", href: "#developers" },
  { name: "Pricing", href: "#pricing" },
];

const PRESS =
  "border-[3px] border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all duration-150";

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Highlight the link of the section currently in view
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  /**
   * NOTE: anchor scrolling is handled globally by <SmoothScroll /> (it glides to #ids).
   * Without it (touch / reduced-motion) the browser's native anchor jump still works.
   * So we only need to close the mobile menu here — no preventDefault / scrollIntoView.
   */
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="w-full bg-black text-white text-xs font-mono-nb py-2 px-4 border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFE500] text-black text-[10px] font-bold uppercase tracking-wider -rotate-2">
              <Sparkles className="w-2.5 h-2.5" strokeWidth={3} />
              NEW
            </span>
            <span className="tracking-wide font-bold">
              Astragen 2.0 Engine is live — Ultra-fast Gemini AI Content Generation
            </span>
          </div>
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1 font-bold text-[#FFE500] hover:underline decoration-2 underline-offset-4 uppercase text-[11px] tracking-wider"
          >
            Launch Studio <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* Main header */}
      <header className="w-full bg-[#FFF4E0] border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[#FF6AD5] text-black border-[3px] border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center transition-transform duration-200 group-hover:-rotate-12">
              <Sparkles className="w-5 h-5" strokeWidth={3} />
            </div>
            <span className="font-display uppercase text-2xl leading-none text-black">
              Astragen
            </span>
            <span className="hidden sm:inline-block font-mono-nb text-[10px] font-bold uppercase px-2 py-0.5 bg-[#3B3BFF] text-white border-2 border-black rotate-3">
              AI
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 font-mono-nb text-[11px] font-bold uppercase tracking-wide border-[3px] transition-all duration-150 hover:bg-[#FFE500] hover:border-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0 active:shadow-none ${
                    isActive
                      ? "bg-[#FFE500] border-black shadow-[3px_3px_0_0_#000]"
                      : "bg-transparent border-transparent text-black"
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3B3BFF] text-white font-mono-nb text-xs uppercase font-bold tracking-wider ${PRESS}`}
            >
              Open Studio
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
            </Link>

            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className={`md:hidden p-2 bg-[#FFE500] text-black ${PRESS}`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={3} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={3} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden bg-[#FF6AD5] border-t-[3px] border-black"
            >
              <div className="px-4 py-4 space-y-2.5">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    className={`flex items-center justify-between px-4 py-3 bg-white text-black font-display uppercase text-lg ${PRESS}`}
                  >
                    {link.name}
                    <ArrowRight className="w-5 h-5" strokeWidth={3} />
                  </motion.a>
                ))}
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className={`block w-full text-center py-3 px-4 bg-black text-white font-mono-nb text-sm uppercase font-bold tracking-wider ${PRESS}`}
                >
                  Open Studio
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}