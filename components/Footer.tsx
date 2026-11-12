"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  Send,
  Check,
  Github,
  Linkedin,
  Mail,
  Zap,
  ShieldCheck,
  Terminal,
} from "lucide-react";

const C = {
  yellow: "#FFE500",
  pink: "#FF6AD5",
  blue: "#3B3BFF",
  green: "#00E676",
  sky: "#7DD3FC",
  orange: "#FF5C00",
};

interface LinkItem {
  label: string;
  href: string;
  ext?: boolean;
  badge?: string;
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2500);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderCol = (
    title: string,
    tagBg: string,
    links: LinkItem[]
  ) => (
    <div className="space-y-4">
      <div className="inline-block">
        <span
          className="font-mono-nb text-xs font-bold uppercase px-2.5 py-1 text-black border-2 border-white shadow-[2px_2px_0_0_#fff] inline-flex items-center gap-1.5"
          style={{ background: tagBg }}
        >
          {"// "}{title}
        </span>
      </div>
      <ul className="space-y-2.5 font-body text-sm font-bold">
        {links.map((l) => (
          <li key={l.label}>
            {l.ext ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors hover:underline decoration-[3px] underline-offset-4 decoration-[#FF6AD5]"
              >
                <span>{l.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                {l.badge && (
                  <span className="font-mono-nb text-[9px] px-1.5 py-0.2 bg-[#00E676] text-black border border-white font-extrabold uppercase ml-1">
                    {l.badge}
                  </span>
                )}
              </a>
            ) : (
              <Link
                href={l.href}
                className="group inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors hover:underline decoration-[3px] underline-offset-4 decoration-[#FF6AD5]"
              >
                <span>{l.label}</span>
                {l.badge && (
                  <span className="font-mono-nb text-[9px] px-1.5 py-0.2 bg-[#FFE500] text-black border border-white font-extrabold uppercase ml-1">
                    {l.badge}
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="w-full bg-black text-white border-t-[4px] border-black overflow-hidden relative">
      {/* Top Neobrutalist Status & Feature Ticker */}
      <div className="w-full bg-[#FFE500] text-black border-b-[3px] border-black py-2.5 px-4 font-mono-nb text-xs font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00E676] border-2 border-black rounded-full animate-pulse" />
            <span className="tracking-tight sm:tracking-normal">
              SYSTEM STATUS: ALL ENGINES OPERATIONAL
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <Zap className="w-3 h-3" /> GEMINI 2.0 FLASH
            </span>
            <span>{"//"}</span>
            <span>NEON POSTGRES</span>
            <span>{"//"}</span>
            <span>50+ GENERATION ENGINES</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-[#FFE500] border-2 border-black text-[10px] -rotate-1 font-extrabold">
              FREE TIER AVAILABLE
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand Bio (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div
                className="w-11 h-11 border-[3px] border-white flex items-center justify-center -rotate-3 transition-transform duration-200 group-hover:rotate-0 shadow-[4px_4px_0_0_#FFE500]"
                style={{ background: C.pink, color: "#000" }}
              >
                <Sparkles className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display uppercase text-2xl tracking-wide text-white">
                    Astragen
                  </span>
                  <span className="font-mono-nb text-[10px] font-bold uppercase px-2 py-0.5 bg-[#3B3BFF] text-white border-2 border-white rotate-2">
                    AI 2.0
                  </span>
                </div>
                <p className="font-mono-nb text-[10px] text-white/60 uppercase tracking-widest mt-0.5">
                  Generative Content Studio
                </p>
              </div>
            </Link>

            <p className="font-body text-sm text-white/75 leading-relaxed max-w-sm">
              Raw, loud, and blazingly fast AI content synthesis. Powered by Google
              Gemini and engineered for creators, marketers, and developers who ship daily.
            </p>

            {/* Live capability pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border-2 border-white/40 font-mono-nb text-xs text-white/90">
              <Terminal className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Streaming 100+ tokens/sec</span>
            </div>

            {/* Neobrutalist Social Icons */}
            <div className="pt-2">
              <p className="font-mono-nb text-xs uppercase text-white/60 mb-2.5 font-bold">
                Connect &amp; Star:
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://github.com/codewith-yush/Astragen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#FFE500] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#FFE500] transition-all"
                  aria-label="GitHub Repository"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ayush-singh-643a4b25a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#3B3BFF] text-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#FF6AD5] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#FF6AD5] transition-all"
                  aria-label="Ayush Singh LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/om-vishwakarma-467b8933b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#FFE500] text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#00E676] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#00E676] transition-all"
                  aria-label="Om Vishwakarma LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <Link
                  href="/contact"
                  className="w-10 h-10 bg-[#00E676] text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#fff] transition-all"
                  aria-label="Contact Support"
                >
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Links Columns (5 cols total on lg) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-2 gap-8">
            {renderCol("PRODUCT", C.yellow, [
              { label: "AI Studio", href: "/dashboard" },
              { label: "50+ Engines", href: "/#features", badge: "HOT" },
              { label: "Pro Pricing", href: "/#pricing" },
              { label: "Interactive Demo", href: "/demo" },
              { label: "History Log", href: "/dashboard/history" },
            ])}

            {renderCol("RESOURCES", C.pink, [
              { label: "Tech Stack", href: "/about/technology" },
              { label: "Documentation", href: "/about/learnmore" },
              { label: "System Status", href: "/about/technology#status" },
              { label: "Support & Help", href: "/contact" },
              { label: "GitHub Repo", href: "https://github.com/codewith-yush/Astragen", ext: true },
            ])}
          </div>

          {/* Newsletter / Dispatch Form (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="inline-block">
              <span
                className="font-mono-nb text-xs font-bold uppercase px-2.5 py-1 text-black border-2 border-white shadow-[2px_2px_0_0_#fff] inline-flex items-center gap-1.5"
                style={{ background: C.sky }}
              >
                {"// DISPATCH"}
              </span>
            </div>

            <p className="font-body text-sm text-white/75 leading-relaxed">
              Get battle-tested prompt recipes, new template drops, and engineering updates straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border-2 border-white text-white font-mono-nb text-xs placeholder:text-white/40 focus:outline-none focus:border-[#FFE500] focus:ring-1 focus:ring-[#FFE500]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#FFE500] text-black font-mono-nb text-xs font-bold uppercase tracking-wider border-2 border-white shadow-[3px_3px_0_0_#FF6AD5] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#FF6AD5] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4 text-black" strokeWidth={3} />
                    Subscribed!
                  </>
                ) : (
                  <>
                    Join Dispatch <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-1.5 text-[11px] font-mono-nb text-white/50 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Zero spam • Unsubscribe anytime</span>
            </div>
          </div>
        </div>

        {/* GIANT BRAND WATERMARK BANNER (Full width, responsive clamp, no overflow) */}
        <div className="relative w-full overflow-hidden my-10 py-8 border-y-[3px] border-white/20 bg-neutral-950 flex flex-col items-center justify-center">
          {/* Subtle dots pattern */}
          <div className="absolute inset-0 nb-dots opacity-15 pointer-events-none" />

          <div className="relative z-10 w-full flex items-center justify-center px-4">
            <span
              className="font-display uppercase tracking-tight text-[clamp(3.2rem,14vw,10.5rem)] leading-none text-center select-none cursor-default transition-all duration-300 hover:tracking-normal"
              style={{
                color: "#FFE500",
                textShadow: "4px 4px 0 #FF6AD5, 8px 8px 0 #000",
              }}
            >
              Astragen
            </span>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-mono-nb font-bold text-white/80 uppercase">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FF6AD5] text-black border-2 border-black -rotate-1 shadow-[2px_2px_0_0_#fff]">
              <Sparkles className="w-3 h-3" /> RAW
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FFE500] text-black border-2 border-black rotate-1 shadow-[2px_2px_0_0_#fff]">
              <Zap className="w-3 h-3" /> LOUD
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00E676] text-black border-2 border-black -rotate-2 shadow-[2px_2px_0_0_#fff]">
              ⚡ NEOBRUTALIST
            </span>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Tech Specs, Back to Top */}
        <div className="pt-6 border-t-[3px] border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-nb text-white/60">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Astragen AI. All rights reserved.</p>
            <span className="hidden sm:inline text-white/30">•</span>
            <p>Crafted by Ayush Singh &amp; Om Vishwakarma</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white font-mono-nb text-xs font-bold uppercase border-2 border-white/60 shadow-[3px_3px_0_0_#FFE500] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#FFE500] hover:text-[#FFE500] transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
