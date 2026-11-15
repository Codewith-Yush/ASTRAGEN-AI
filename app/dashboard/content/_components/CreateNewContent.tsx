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
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";

import FormSection from "./FormSection";
import TEMPLATES from "@/data/templates-meta";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";

const OutputSection = dynamic(() => import("./OutputSection"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 text-ink-dim">
      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      <span className="text-[12px]">Loading output…</span>
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
    () => (templateSlug ? TEMPLATES?.find((item) => item.slug === templateSlug) : undefined),
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

  const wordCount = useMemo(() => {
    const t = aiOutput.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [aiOutput]);

  // ---- Template not found -------------------------------------------------
  if (!selectedTemplate) {
    return (
      <div className="mx-auto mt-16 max-w-sm space-y-4 rounded-[8px] border border-border bg-surface p-6 text-center">
        <AlertCircle className="mx-auto h-5 w-5 text-ink-dim" strokeWidth={1.5} aria-hidden="true" />
        <div className="space-y-1">
          <h1 className="text-[14px] font-medium text-ink">Template not found</h1>
          <p className="text-[13px] text-ink-muted">
            We couldn&apos;t find the template you&apos;re looking for.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-8 items-center gap-1.5 rounded-[6px] bg-action px-3 text-[13px] font-medium text-action-ink transition-colors hover:bg-action-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back to studio
        </Link>
      </div>
    );
  }

  const tabClasses = (active: boolean) =>
    `flex h-full flex-1 items-center justify-center gap-1.5 text-[12px] transition-colors ${
      active
        ? "border-b-2 border-ink font-medium text-ink"
        : "border-b-2 border-transparent text-ink-muted hover:text-ink"
    }`;

  const quotaError = error?.toLowerCase().includes("quota");

  const statusLabel = loading ? "Generating" : error ? "Error" : aiOutput ? "Done" : "Ready";

  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-[520px] flex-col bg-surface">
      {/* Inline error banner */}
      {error && (
        <div
          role="alert"
          className="flex shrink-0 items-center gap-2.5 border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-[13px] text-rose-600 dark:text-rose-300"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <p className="flex-1">{error}</p>
          {quotaError && (
            <button
              type="button"
              onClick={() => router.push("/dashboard/billing")}
              className="h-6 rounded-[6px] bg-rose-600 px-2.5 text-[12px] font-medium text-white transition-colors hover:bg-rose-700"
            >
              Upgrade
            </button>
          )}
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="rounded-[4px] p-1 transition-colors hover:bg-rose-500/20"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Mobile tab switcher (< lg) */}
      <div
        role="tablist"
        aria-label="Workspace view"
        className="flex h-10 shrink-0 border-b border-border lg:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === "form"}
          aria-controls="panel-form"
          onClick={() => setMobileTab("form")}
          className={tabClasses(mobileTab === "form")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <span>Input</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === "output"}
          aria-controls="panel-output"
          onClick={() => setMobileTab("output")}
          className={tabClasses(mobileTab === "output")}
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          <span>Output</span>
          {loading && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-action" aria-label="Generating" />
          )}
          {aiOutput && !loading && (
            <span className="h-1.5 w-1.5 rounded-full bg-ink-dim" aria-label="Output ready" />
          )}
        </button>
      </div>

      {/* Workbench: form | output in one frame */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)]">
        <div
          id="panel-form"
          role="tabpanel"
          className={`min-h-0 flex-col border-border lg:flex lg:border-r ${
            mobileTab === "form" ? "flex" : "hidden"
          }`}
        >
          <FormSection
            selectedTemplate={selectedTemplate as any}
            userFormInput={GenerateAIContent}
            loading={loading}
            onStop={handleStopGeneration}
          />
        </div>

        <div
          id="panel-output"
          role="tabpanel"
          className={`min-h-0 min-w-0 flex-col bg-canvas lg:flex ${
            mobileTab === "output" ? "flex" : "hidden"
          }`}
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

      {/* Status line */}
      <div
        className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-surface px-4 font-mono text-[11px] text-ink-dim"
        role="status"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              loading
                ? "animate-pulse bg-action"
                : error
                ? "bg-rose-500"
                : aiOutput
                ? "bg-emerald-500"
                : "bg-ink-dim"
            }`}
          />
          {statusLabel}
        </span>
        <span className="tabular-nums">
          {wordCount > 0 ? `${wordCount.toLocaleString()} words · ` : ""}
          Gemini
        </span>
      </div>
    </div>
  );
}