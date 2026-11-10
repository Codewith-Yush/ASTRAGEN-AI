"use client";

import React, { useContext, useState, useRef } from "react";
import FormSection from "../_components/FormSection";
import OutputSection from "../_components/OutputSection";
import Templates from "@/app/(data)/Templates";
import { ArrowLeft, Sparkles, SlidersHorizontal, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TotalUsageContext } from "@/app/(context)/TotalUsageContext";
import { useRouter } from "next/navigation";
import { UserSubscriptionContext } from "@/app/(context)/UserSubscriptionContext";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";

interface PROPS {
  params: Promise<{ "template-slug": string }>;
}

function CreateNewContent(props: PROPS) {
  const resolvedParams = React.use(props.params);
  const templateSlug = resolvedParams["template-slug"];
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<"form" | "output">("form");
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const { totalUsage } = useContext(TotalUsageContext);
  const { userSubscription } = useContext(UserSubscriptionContext);
  const { setUpdateCreditUsage } = useContext(UpdateCreditUsageContext);

  const selectedTemplate = templateSlug
    ? Templates?.find((item) => item.slug === templateSlug)
    : undefined;

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const GenerateAIContent = async (formData: any) => {
    if (!templateSlug || !selectedTemplate) {
      console.error("Template not loaded yet. Please wait.");
      return;
    }

    if (Number(totalUsage) >= 300000 && !userSubscription) {
      alert("You have reached your free monthly credit quota. Please upgrade to Pro.");
      router.push("/dashboard/billing");
      return;
    }

    setLoading(true);
    setAiOutput("");
    // Automatically switch mobile view to output tab so user sees stream
    setMobileTab("output");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: selectedTemplate.slug,
          formData,
        }),
        signal: controller.signal,
      });

      if (response.status === 402) {
        alert("Credit quota exceeded. Please upgrade to Pro to continue.");
        router.push("/dashboard/billing");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      if (!response.body) {
        throw new Error("Streaming not supported by browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAiOutput(accumulated);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Generation gracefully aborted by user");
        return;
      }
      console.error("Error generating AI content:", error);
      alert(error.message || "Error generating AI content");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      setUpdateCreditUsage(Date.now());
    }
  };

  const handleEdit = (newContent: string) => {
    setAiOutput(newContent);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex-shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {selectedTemplate && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center p-2 shadow-sm flex-shrink-0">
                <Image
                  src={selectedTemplate.icon}
                  alt={selectedTemplate.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                  {selectedTemplate.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {selectedTemplate.desc}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-time Gemini Streaming</span>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on < lg screens) */}
      <div className="flex lg:hidden rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1 border border-slate-300/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "form"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Configuration</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "output"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>AI Output</span>
          {loading && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          )}
          {aiOutput && !loading && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
          )}
        </button>
      </div>

      {/* Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div
          className={`lg:col-span-5 ${
            mobileTab === "form" ? "block" : "hidden lg:block"
          }`}
        >
          {selectedTemplate ? (
            <FormSection
              selectedTemplate={selectedTemplate as any}
              userFormInput={(v: any) => GenerateAIContent(v)}
              loading={loading}
            />
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-slate-400">
              Loading template...
            </div>
          )}
        </div>

        {/* Output Column */}
        <div
          className={`lg:col-span-7 ${
            mobileTab === "output" ? "block" : "hidden lg:block"
          }`}
        >
          <OutputSection
            aiOutput={aiOutput}
            title={selectedTemplate?.name ? `${selectedTemplate.name} Output` : "AI Output"}
            templateName={selectedTemplate?.name}
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

export default CreateNewContent;
