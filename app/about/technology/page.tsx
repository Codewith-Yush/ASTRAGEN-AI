"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap, Cpu, Layers, ShieldCheck, Sparkles } from "lucide-react";

const TECH_FEATURES = [
  {
    title: "Gemini 2.0 Flash Core",
    description: "Real-time streaming generation delivering 100+ tokens per second with optimized prompt pipelines and low-latency token decoding.",
    icon: Zap,
    tag: "MODEL ENGINE",
  },
  {
    title: "Serverless Neon Postgres",
    description: "Instant persistence with Drizzle ORM, connection pooling, and sub-10ms query execution across globally distributed database nodes.",
    icon: Cpu,
    tag: "DATA LAYER",
  },
  {
    title: "50+ Specialized Prompt Engines",
    description: "Individually calibrated generation engines for blogs, social copy, SEO metadata, documentation, and syntactically correct code.",
    icon: Layers,
    tag: "WORKFLOW",
  },
  {
    title: "Enterprise Auth & Guardrails",
    description: "Clerk session authentication, rate limiting, credit reservation locks, and built-in content safety filtering.",
    icon: ShieldCheck,
    tag: "INFRASTRUCTURE",
  },
];

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <header className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border text-[11px] font-medium text-accent-cyan">
            <Sparkles className="w-3 h-3 text-accent-cyan" />
            <span>UNDER THE HOOD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            Architecture &amp; Core Technology
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Astragen is built from the ground up for high token throughput, instant reactivity, and reliable serverless scale.
          </p>
        </header>

        {/* Technology Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {TECH_FEATURES.map(({ title, description, icon: Icon, tag }, index) => (
            <div
              key={index}
              className="p-6 sm:p-7 rounded-2xl bg-surface border border-border shadow-xs hover:border-border-subtle transition-colors space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-action">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-accent-cyan px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border">
                  {tag}
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Live System Specs Bar */}
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-semibold text-ink tabular-nums">100+ t/s</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Streaming Throughput</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold text-ink tabular-nums">&lt;250ms</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Time to First Token</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold text-ink tabular-nums">50+</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Active AI Engines</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-semibold text-ink tabular-nums">99.9%</p>
              <p className="text-[11px] text-ink-muted mt-0.5">API Availability</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-ink">
            Ready to experience the technology?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm bg-action text-action-ink hover:bg-action-hover transition-all shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/about/learnmore"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-xs sm:text-sm border border-border bg-surface text-ink hover:bg-surface-elevated transition-colors inline-flex items-center justify-center"
            >
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
