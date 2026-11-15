import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { streamText } from "@/utils/AiModal";
import { buildRefineMessages } from "@/lib/ai/refinePrompts";
import { db } from "@/utils/db";
import { AIOutput, UserSubscription } from "@/utils/schema";
import { checkRateLimit } from "@/lib/rateLimit";
import { eq, sql } from "drizzle-orm";

const RATE_LIMIT_MAX = 30; // refinements per user
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute

const MAX_CONTENT_CHARS = 60_000;
const MAX_CUSTOM_CHARS = 500;

const refineSchema = z
  .object({
    content: z
      .string()
      .min(1, "Content is required to refine")
      .max(MAX_CONTENT_CHARS, `Content is too long to refine (max ${MAX_CONTENT_CHARS.toLocaleString()} characters)`),
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
    customPrompt: z.string().max(MAX_CUSTOM_CHARS, `Instruction is too long (max ${MAX_CUSTOM_CHARS} characters)`).optional(),
  })
  .refine((d) => d.action !== "custom" || !!d.customPrompt?.trim(), {
    message: "Please type what you want to change",
    path: ["customPrompt"],
  });

export const runtime = "nodejs";
export const maxDuration = 60;

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

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

    // Best-effort throttle per user (cheap check, runs before any DB or AI work)
    const limit = checkRateLimit(`refine:${email}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${limit.retryAfterSeconds}s and try again.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

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

    // Rules + the one edit instruction live in lib/ai/refinePrompts.ts
    const { system, user: userMessage } = buildRefineMessages(content, action, customPrompt);
    const fullPrompt = `${system}\n\n${userMessage}`;

    // Output is about as long as the input (expand needs more headroom).
    // Rough rule: 1 token ~ 2-4 characters, so chars/2 is a safe upper bound.
    const maxOutputTokens = Math.min(16384, Math.max(4096, Math.ceil(content.length / 2)));

    // Editing should stay faithful to the text, so keep randomness low.
    const temperature = action === "fix_grammar" ? 0.2 : 0.5;

    // Wait for the FIRST chunk here, so fallback, timeouts and API errors
    // return a proper JSON error instead of a broken stream.
    const iterator = streamText(fullPrompt, {
      generationConfig: { temperature, maxOutputTokens },
    })[Symbol.asyncIterator]();
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