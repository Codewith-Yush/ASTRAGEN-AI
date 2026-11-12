import { db } from "@/utils/db";
import { AIOutput } from "@/utils/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <Clock3 className="w-10 h-10 text-slate-400 mb-3" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Sign in required
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Please sign in to view your saved AI generation history.
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Content History
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              {historyList.length} saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, inspect, and copy all your previously generated AI drafts in one place.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Generation</span>
        </Link>
      </div>

      {/* Interactive History Component with Search & Modal Preview */}
      <HistoryClient historyList={historyList} />
    </div>
  );
}

export default History;
