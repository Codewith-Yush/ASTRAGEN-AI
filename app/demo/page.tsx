"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-4 sm:p-8 py-16 font-sans">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Top Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border text-[11px] font-medium text-accent-cyan">
            <Sparkles className="w-3 h-3 text-accent-cyan" />
            <span>PRODUCT WALKTHROUGH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Watch Astragen AI in Action
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-lg mx-auto">
            See how prompt synthesis, real-time Gemini 2.0 streaming, and one-click exports work in a single unified workbench.
          </p>
        </div>

        {/* Video Theater Frame */}
        <div className="w-full rounded-2xl border border-border overflow-hidden shadow-xl bg-black aspect-video relative">
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm bg-action text-action-ink hover:bg-action-hover transition-all shadow-xs inline-flex items-center justify-center gap-2"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm border border-border bg-surface text-ink hover:bg-surface-elevated transition-colors inline-flex items-center justify-center"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
