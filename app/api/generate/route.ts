import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import Templates from "@/app/(data)/Templates";
import { streamText } from "@/utils/AiModal";
import { db } from "@/utils/db";
import { AIOutput, UserSubscription } from "@/utils/schema";
import { eq, sql } from "drizzle-orm";

const generateSchema = z.object({
  templateSlug: z.string().min(1, "Template slug is required"),
  formData: z.record(z.any()),
});

export const runtime = "nodejs";

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
        { error: "Unauthorized. Please sign in to generate content." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = generateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { templateSlug, formData } = parsed.data;

    // Verify template existence on server
    const template = Templates.find((t) => t.slug === templateSlug);
    if (!template) {
      return NextResponse.json(
        { error: `Template with slug '${templateSlug}' not found` },
        { status: 404 }
      );
    }

    // Check subscription status
    const subs = await db
      .select()
      .from(UserSubscription)
      .where(eq(UserSubscription.email, email))
      .limit(1);

    const isSubscribed = subs.length > 0 && subs[0].active === true;

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

      // Concurrency safety: provisionally reserve quota before generation
      const [reserved] = await db
        .insert(AIOutput)
        .values({
          formData: JSON.stringify(formData),
          templateSlug,
          aiResponse: "",
          createdBy: email,
          wordCount: 150, // Provisional reservation
          createdAt: new Date(),
        })
        .returning({ id: AIOutput.id });
      reservedId = reserved?.id ?? null;
    }

    // Build the final prompt on the server
    const prompt = `${JSON.stringify(formData)}, ${template.aiPrompt}`;

    // Start generation and wait for the FIRST chunk here, so model fallback,
    // timeouts and API errors return a proper JSON error instead of a broken stream.
    const iterator = streamText(prompt)[Symbol.asyncIterator]();
    let first: IteratorResult<string>;
    try {
      first = await iterator.next();
    } catch (err: any) {
      console.error("Gemini failed before first token:", err);
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
          formData: JSON.stringify(formData),
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
          console.error("Stream processing error:", streamError);
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
    console.error("AI Generation error:", error);
    await releaseReservation();
    return NextResponse.json(
      { error: error?.message || "Internal server error during content generation" },
      { status: 500 }
    );
  }
}