import { db } from "@/utils/db";
import { AIOutput } from "@/utils/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import React from "react";
import { Clock3, Sparkles } from "lucide-react";
import HistoryClient from "./_components/HistoryClient";

export const dynamic = "force-dynamic";

export interface HISTORY {
  id: number;
  formData: string;
  aiResponse: string | null;
  templateSlug: string;
  createdBy: string;
  createdAt: string | Date;
}

async function History() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-surface rounded-2xl border border-border">
        <Clock3 className="w-10 h-10 text-ink-muted mb-3" strokeWidth={1.5} />
        <h2 className="text-base font-semibold text-ink">
          Sign in required
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Please sign in to view your generation history.
        </p>
      </div>
    );
  }

  let historyList: HISTORY[] = [];
  try {
    historyList = (await db
      .select({
        id: AIOutput.id,
        formData: AIOutput.formData,
        aiResponse: AIOutput.aiResponse,
        templateSlug: AIOutput.templateSlug,
        createdBy: AIOutput.createdBy,
        createdAt: AIOutput.createdAt,
      })
      .from(AIOutput)
      .where(eq(AIOutput.createdBy, email))
      .orderBy(desc(AIOutput.id))
      .limit(100)) as HISTORY[];
  } catch (error) {
    console.error("Failed to query history from database:", error);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-page-title text-ink font-semibold tracking-tight">
              History
            </h1>
            <span className="text-xs tabular-nums font-medium px-2.5 py-0.5 rounded-full bg-surface-elevated text-accent-cyan border border-border">
              {historyList.length} saved
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Search, preview, and re-run previously generated content.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-dim">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" strokeWidth={1.5} />
          <span>Saved to Neon PostgreSQL</span>
        </div>
      </div>

      {/* Main Interactive Table & Inspection Drawer */}
      <HistoryClient historyList={historyList} />
    </div>
  );
}

export default History;
