"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

type TemplateCardProps = {
  icon: string;
  name: string;
  desc: string;
  slug: string;
  category?: string;
  featured?: boolean;
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blog: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/25",
  },
  youtube: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/25",
  },
  coding: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/25",
  },
  "social media": {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/25",
  },
  marketing: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/25",
  },
  education: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/25",
  },
  writing: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/25",
  },
};

function TemplateCard({
  icon,
  name,
  desc,
  slug,
  category = "AI Engine",
  featured = false,
}: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);
  const catKey = category.toLowerCase();
  const theme = CATEGORY_COLORS[catKey] || {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/25",
  };

  return (
    <Link
      href={`/dashboard/content/${slug}`}
      aria-label={`Use ${name} template`}
      className="group relative block h-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
    >
      <article
        style={{ contentVisibility: "auto", containIntrinsicSize: "0 220px" }}
        className={`relative flex h-full flex-col justify-between p-5 rounded-2xl bg-white/90 dark:bg-[#0C0E14]/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/15 overflow-hidden ${
          featured ? "ring-2 ring-indigo-500/20" : ""
        }`}
      >
        {/* Subtle decorative hover glow in top corner */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div>
          {/* Header Row: Icon + Category Badge + Featured indicator */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800/80 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center p-2 shadow-2xs group-hover:scale-105 group-hover:rotate-1 transition-all duration-200 shrink-0">
              {icon && !imageError ? (
                <Image
                  src={icon}
                  alt={name}
                  width={26}
                  height={26}
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  Top Pick
                </span>
              )}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}
              >
                {category}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
            {name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
            {desc}
          </p>
        </div>

        {/* Footer: Action Row */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <span className="flex items-center gap-1">
            <span>Launch Engine</span>
          </span>
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default React.memo(TemplateCard);
