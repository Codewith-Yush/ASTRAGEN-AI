"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-[#090A0C] text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-8 py-16">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Top Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <Sparkles className="w-3 h-3 text-neutral-500" />
            <span>Product Walkthrough</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Watch Astragen AI in Action
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            See how prompt synthesis, real-time Gemini 2.0 streaming, and one-click exports work in a single unified workbench.
          </p>
        </div>

        {/* Video Theater Frame */}
        <div className="w-full rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-xl bg-black aspect-video relative">
          <iframe
            src="https://www.youtube.com/embed/jPskRlbqDPg?si=JytQPEQ1-dbOX1Q9"
            title="Astragen AI Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Bottom CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs inline-flex items-center justify-center gap-2"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#121418] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors inline-flex items-center justify-center"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
