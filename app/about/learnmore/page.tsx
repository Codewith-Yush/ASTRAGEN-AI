"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Lightbulb, Cpu, ShieldCheck, Sparkles } from "lucide-react";

const APPROACH_ITEMS = [
  {
    title: "Human-Amplified Creativity",
    description: "We build intuitive, high-velocity tools that enhance rather than replace human creative judgment, style, and domain expertise.",
    icon: Lightbulb,
    tag: "PHILOSOPHY",
  },
  {
    title: "Production-Grade AI Architecture",
    description: "Engineered on Google Gemini transformer models with carefully curated prompting structures to eliminate hallucination and maximize content clarity.",
    icon: Cpu,
    tag: "ENGINEERING",
  },
  {
    title: "Ethical & Responsible Framework",
    description: "Built-in safety protocols, transparent usage tracking, data privacy standards, and copyright awareness at every step of content generation.",
    icon: ShieldCheck,
    tag: "TRUST & SAFETY",
  },
];

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-[#090A0C] text-neutral-900 dark:text-neutral-100 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Section */}
        <header className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            <Sparkles className="w-3 h-3 text-neutral-500" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Empowering creators through intelligent AI
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Astragen bridges advanced foundational models and real-world creator workflows to deliver fast, structured, publication-grade results.
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-4">
          {APPROACH_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#121418] border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex flex-col sm:flex-row items-start gap-4 sm:gap-5"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                      {item.title}
                    </h2>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 px-2 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="p-8 sm:p-10 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#121418] text-center space-y-4 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">
            Ready to accelerate your workflow?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Join thousands of writers, founders, and engineers using Astragen to produce original content in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs inline-flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/about/technology"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#121418] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors inline-flex items-center justify-center"
            >
              <span>Explore Tech Stack</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
