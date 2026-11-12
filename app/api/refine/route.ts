import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { streamText } from "@/utils/AiModal";
import { db } from "@/utils/db";
import { AIOutput, UserSubscription } from "@/utils/schema";
import { eq, sql } from "drizzle-orm";

const refineSchema = z.object({
  content: z.string().min(1, "Content is required to refine"),
  action: z.enum([
    "summarize",
    "expand",
    "professional",
    "casual",
    "bullet_points",
    "fix_grammar",
    "simplify",
    "custom",
  ]),
  customPrompt: z.string().optional(),
});

export const runtime = "nodejs";

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const INSTRUCTIONS: Record<string, string> = {
  summarize:
    "Summarize the following content concisely and powerfully, retaining all key takeaways and core insights:",
  expand:
    "Expand upon the following content with additional depth, detailed explanations, actionable examples, and structured sections:",
  professional:
    "Rewrite the following content in an authoritative, executive, polished, and professional tone:",
  casual:
    "Rewrite the following content in a friendly, conversational, engaging, and accessible tone:",
  bullet_points:
    "Transform and restructure the following content into clean, punchy bullet points and actionable takeaways:",
  fix_grammar:
    "Proofread, fix all grammar, punctuation, and spelling errors, and enhance readability and sentence flow:",
  simplify:
    "Simplify the following content so that it is crystal-clear, jargon-free, and easy for any reader to understand:",
};

export async function POST(req: NextRequest) {
  let reservedId: number | null = null;

  // Releases the provisional quota row if nothing was generated
  const releaseReservation = async () => {
    if (reservedId) {
      await db.delete(AIOutput).where(eq(AIOutput.id, reservedId)).catch(() => {});
    }
  };

  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to refine content." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = refineSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { content, action, customPrompt } = parsed.data;

    // Check subscription status
    const subs = await db
      .select()
      .from(UserSubscription)
      .where(eq(UserSubscription.email, email))
      .limit(1);

    const isSubscribed = subs.length > 0 && subs[0].active === true;

    const meta = JSON.stringify({ action, originalChars: content.length });
    const templateSlug = `refine-${action}`;

    // Check usage limits if not subscribed
    if (!isSubscribed) {
      const usageResult = await db
        .select({
          total: sql<number>`coalesce(sum(case when "wordCount" > 0 then "wordCount" else length("aiResponse") end), 0)::int`,
        })
        .from(AIOutput)
        .where(eq(AIOutput.createdBy, email));

      const currentUsage = usageResult[0]?.total ?? 0;
      if (currentUsage >= 300000) {
        return NextResponse.json(
          { error: "Free credit quota exceeded. Please upgrade your subscription to continue." },
          { status: 402 }
        );
      }

      // Concurrency safety: provisionally reserve quota before refinement
      const [reserved] = await db
        .insert(AIOutput)
        .values({
          formData: meta,
          templateSlug,
          aiResponse: "",
          createdBy: email,
          wordCount: 150, // Provisional reservation
          createdAt: new Date(),
        })
        .returning({ id: AIOutput.id });
      reservedId = reserved?.id ?? null;
    }

    const instruction =
      action === "custom"
        ? customPrompt?.trim() || "Refine and enhance the following content to improve quality:"
        : INSTRUCTIONS[action];

    const fullPrompt = `${instruction}

Content to refine:
${content}

Strict Instructions:
1. Return ONLY the refined content in Markdown formatting.
2. Do NOT add any preamble, conversational introduction (e.g., "Here is your summary"), or concluding commentary.
3. Preserve key facts, figures, and technical accuracy while applying the requested transformation.`;

    // Wait for the FIRST chunk here, so fallback, timeouts and API errors
    // return a proper JSON error instead of a broken stream.
    const iterator = streamText(fullPrompt)[Symbol.asyncIterator]();
    let first: IteratorResult<string>;
    try {
      first = await iterator.next();
    } catch (err) {
      console.error("Gemini failed before first token (refine):", err);
      await releaseReservation();
      return NextResponse.json(
        { error: "AI service is busy right now. Please try again in a moment." },
        { status: 503 }
      );
    }

    const encoder = new TextEncoder();
    let accumulatedText = "";
    let finalized = false;

    // Saves the result once (full or partial)
    const finalize = async () => {
      if (finalized) return;
      finalized = true;

      if (!accumulatedText) {
        await releaseReservation();
        return;
      }

      const wordCount = countWords(accumulatedText);
      if (reservedId) {
        await db
          .update(AIOutput)
          .set({ aiResponse: accumulatedText, wordCount })
          .where(eq(AIOutput.id, reservedId));
      } else {
        await db.insert(AIOutput).values({
          formData: meta,
          templateSlug,
          aiResponse: accumulatedText,
          createdBy: email,
          wordCount,
          createdAt: new Date(),
        });
      }
    };

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (!first.done) {
            accumulatedText += first.value;
            controller.enqueue(encoder.encode(first.value));
          }

          while (!first.done) {
            const next = await iterator.next();
            if (next.done) break;
            accumulatedText += next.value;
            controller.enqueue(encoder.encode(next.value));
          }

          await finalize();
          controller.close();
        } catch (streamError) {
          console.error("Refine stream error:", streamError);
          await finalize().catch((e) => console.error("Finalize error:", e));
          try {
            controller.error(streamError);
          } catch {
            // stream already closed/cancelled by the client
          }
        }
      },
      // User navigated away or clicked stop: keep what was generated
      async cancel() {
        await iterator.return?.(undefined);
        await finalize().catch((e) => console.error("Finalize error:", e));
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("Refine API error:", error);
    await releaseReservation();
    return NextResponse.json(
      { error: error?.message || "Internal server error during refinement" },
      { status: 500 }
    );
  }
}