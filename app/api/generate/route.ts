import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import Templates from "@/app/(data)/Templates";
import { streamContent } from "@/utils/AiModal";
import { db } from "@/utils/db";
import { AIOutput, UserSubscription } from "@/utils/schema";
import { eq, sql } from "drizzle-orm";

const generateSchema = z.object({
  templateSlug: z.string().min(1, "Template slug is required"),
  formData: z.record(z.any()),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
    let reservedId: number | null = null;
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

      // Concurrency safety: provisionally reserve quota before initiating generation
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

    // Build the final prompt securely on the server
    const prompt = `${JSON.stringify(formData)}, ${template.aiPrompt}`;

    // Initiate streaming with Gemini (with automatic fallback and timeout)
    const streamResult = await streamContent(prompt);

    const encoder = new TextEncoder();
    let accumulatedText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            accumulatedText += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }

          // Stream completed; update or persist record to database
          const wordCount = accumulatedText.trim().split(/\s+/).filter(Boolean).length;
          if (reservedId) {
            await db
              .update(AIOutput)
              .set({
                aiResponse: accumulatedText,
                wordCount,
              })
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

          controller.close();
        } catch (streamError) {
          console.error("Stream processing error:", streamError);
          // If aborted or failed before generation, cleanup reservation
          if (reservedId && !accumulatedText) {
            await db.delete(AIOutput).where(eq(AIOutput.id, reservedId)).catch(() => {});
          }
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during content generation" },
      { status: 500 }
    );
  }
}

