"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import FormSection from "./FormSection";
import Templates from "@/app/(data)/Templates";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";

const OutputSection = dynamic(() => import("./OutputSection"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[620px] flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/60">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      <span className="mt-2 text-xs text-neutral-400">Loading output workspace...</span>
    </div>
  ),
});

const FREE_USAGE_LIMIT = 300000;
const FLUSH_INTERVAL_MS = 50;

type Tab = "form" | "output";

interface CreateNewContentProps {
  templateSlug?: string;
}

export default function CreateNewContent({ templateSlug: propSlug }: CreateNewContentProps) {
  const params = useParams();
  const router = useRouter();
  const templateSlug = propSlug || (params?.["template-slug"] as string) || "";

  const { totalUsage } = useContext(TotalUsageContext);
  const { userSubscription } = useContext(UserSubscriptionContext);
  const { setUpdateCreditUsage } = useContext(UpdateCreditUsageContext);

  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<Tab>("form");

  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false); // guards against double submits

  const selectedTemplate = useMemo(
    () => (templateSlug ? Templates?.find((item) => item.slug === templateSlug) : undefined),
    [templateSlug]
  );

  // Cancel any in-flight request when leaving the page.
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // Clear output/errors when switching to a different template.
  useEffect(() => {
    abortControllerRef.current?.abort();
    setAiOutput("");
    setError(null);
    setMobileTab("form");
  }, [templateSlug]);

  // Warn before closing the tab while a generation is running.
  useEffect(() => {
    if (!loading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [loading]);

  const handleStopGeneration = useCallback(() => {
    // Partial output is kept so the user doesn't lose what was already streamed.
    abortControllerRef.current?.abort();
  }, []);

  const GenerateAIContent = useCallback(
    async (formData: any) => {
      if (loadingRef.current) return;

      if (!selectedTemplate) {
        setError("This template could not be loaded. Please go back and try again.");
        return;
      }

      if (Number(totalUsage) >= FREE_USAGE_LIMIT && !userSubscription) {
        setError("You've reached your free monthly credit quota. Upgrade to Pro to keep generating.");
        return;
      }

      loadingRef.current = true;
      setLoading(true);
      setError(null);
      setAiOutput("");
      setMobileTab("output"); // let mobile users watch the stream

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulated = "";
      let lastFlushTime = 0;
      let rafId: number | null = null;
      let requestSent = false;

      const cancelPendingFlush = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      const flush = () => {
        cancelPendingFlush();
        setAiOutput(accumulated);
        lastFlushTime = performance.now();
      };

      const scheduleFlush = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          flush();
        });
      };

      try {
        requestSent = true;
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateSlug: selectedTemplate.slug, formData }),
          signal: controller.signal,
        });

        if (response.status === 402) {
          setError("Credit quota exceeded. Upgrade to Pro to continue.");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Failed to generate content. Please try again.");
        }

        if (!response.body) {
          throw new Error("Streaming isn't supported by this browser.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Update at most every ~50ms; otherwise batch into the next animation frame.
          if (performance.now() - lastFlushTime >= FLUSH_INTERVAL_MS) {
            flush();
          } else {
            scheduleFlush();
          }
        }

        accumulated += decoder.decode(); // flush any buffered bytes
        flush();
      } catch (err: any) {
        if (err?.name === "AbortError") {
          flush(); // keep whatever streamed before the user stopped
          return;
        }
        console.error("Error generating AI content:", err);
        flush();
        setError(err?.message || "Something went wrong while generating. Please try again.");
      } finally {
        cancelPendingFlush();
        loadingRef.current = false;
        abortControllerRef.current = null;
        setLoading(false);
        if (requestSent) setUpdateCreditUsage(Date.now());
      }
    },
    [selectedTemplate, totalUsage, userSubscription, setUpdateCreditUsage]
  );

  const handleEdit = useCallback((newContent: string) => setAiOutput(newContent), []);

  // ---- Template not found -------------------------------------------------
  if (!selectedTemplate) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400" aria-hidden="true" />
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-neutral-900 dark:text-white">
            Template not found
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            We couldn&apos;t find the template you&apos;re looking for.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const tabClasses = (active: boolean) =>
    `flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
      active
        ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
    }`;

  const quotaError = error?.toLowerCase().includes("quota");

  return (
    <div className="space-y-5 pb-12">
      {/* Header / breadcrumb */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex-shrink-0 rounded-xl border border-neutral-200/80 bg-white p-2 text-neutral-500 shadow-xs transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-white p-2 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <Image
                src={selectedTemplate.icon}
                alt=""
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="line-clamp-1 text-base font-bold tracking-tight text-neutral-900 dark:text-white sm:text-lg md:text-xl">
                {selectedTemplate.name}
              </h1>
              <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                {selectedTemplate.desc}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
          <span>Real-time Gemini Streaming</span>
        </div>
      </div>

      {/* Inline error banner (replaces blocking alert() dialogs) */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <p>{error}</p>
            {quotaError && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/billing")}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="rounded-md p-1 transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mobile tab switcher (< lg) */}
      <div
        role="tablist"
        aria-label="Workspace view"
        className="flex rounded-xl border border-neutral-200/60 bg-neutral-100 p-1 dark:border-neutral-700/60 dark:bg-neutral-800/80 lg:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === "form"}
          aria-controls="panel-form"
          onClick={() => setMobileTab("form")}
          className={tabClasses(mobileTab === "form")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Configuration</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === "output"}
          aria-controls="panel-output"
          onClick={() => setMobileTab("output")}
          className={tabClasses(mobileTab === "output")}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span>AI Output</span>
          {loading && (
            <span className="relative flex h-2 w-2" aria-label="Generating">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          )}
          {aiOutput && !loading && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white"
              aria-label="Output ready"
            />
          )}
        </button>
      </div>

      {/* Form (left) + Output (right) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div
          id="panel-form"
          role="tabpanel"
          className={`lg:col-span-5 ${mobileTab === "form" ? "block" : "hidden lg:block"}`}
        >
          <FormSection
            selectedTemplate={selectedTemplate as any}
            userFormInput={GenerateAIContent}
            loading={loading}
          />
        </div>

        <div
          id="panel-output"
          role="tabpanel"
          className={`lg:col-span-7 ${mobileTab === "output" ? "block" : "hidden lg:block"}`}
        >
          <OutputSection
            aiOutput={aiOutput}
            title={`${selectedTemplate.name} Output`}
            templateName={selectedTemplate.name}
            onEdit={handleEdit}
            loading={loading}
            onStop={handleStopGeneration}
            readOnly={false}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}