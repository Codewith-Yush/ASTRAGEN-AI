"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

type TemplateCardProps = {
  icon: string;
  name: string;
  desc: string;
  slug: string;
  category?: string;
};

// Subtle category badges
const CATEGORY_COLORS: { [key: string]: string } = {
  blog: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60",
  "social media": "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60",
  coding: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
  writing: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
  marketing: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
  education: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/60",
  youtube: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/60",
};

function TemplateCard({ icon, name, desc, slug, category = "AI Prompt" }: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);

  const badgeClass =
    CATEGORY_COLORS[category.toLowerCase()] ||
    "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60";

  return (
    <Link
      href={`/dashboard/content/${slug}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl active:scale-[0.98] transition-transform duration-100"
      aria-label={`Use ${name} template`}
    >
      <div className="h-full bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 hover:border-indigo-400/80 dark:hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Header with Icon & Category */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center p-2 group-hover:scale-105 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:border-indigo-200/60 dark:group-hover:border-indigo-800/60 transition-all duration-200 flex-shrink-0">
              {!imageError && icon ? (
                <Image
                  src={icon}
                  alt={`${name} icon`}
                  width={24}
                  height={24}
                  className="object-contain"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-500" />
              )}
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}
            >
              {category}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {desc}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Click to generate
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <span>Use</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(TemplateCard);
