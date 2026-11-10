import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { streamContent } from "@/utils/AiModal";

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

export async function POST(req: NextRequest) {
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

    let instruction = "";
    switch (action) {
      case "summarize":
        instruction =
          "Summarize the following content concisely and powerfully, retaining all key takeaways and core insights:";
        break;
      case "expand":
        instruction =
          "Expand upon the following content with additional depth, detailed explanations, actionable examples, and structured sections:";
        break;
      case "professional":
        instruction =
          "Rewrite the following content in an authoritative, executive, polished, and professional tone:";
        break;
      case "casual":
        instruction =
          "Rewrite the following content in a friendly, conversational, engaging, and accessible tone:";
        break;
      case "bullet_points":
        instruction =
          "Transform and restructure the following content into clean, punchy bullet points and actionable takeaways:";
        break;
      case "fix_grammar":
        instruction =
          "Proofread, fix all grammar, punctuation, and spelling errors, and enhance readability and sentence flow:";
        break;
      case "simplify":
        instruction =
          "Simplify the following content so that it is crystal-clear, jargon-free, and easy for any reader to understand:";
        break;
      case "custom":
        instruction =
          customPrompt?.trim() ||
          "Refine and enhance the following content to improve quality:";
        break;
    }

    const fullPrompt = `${instruction}

Content to refine:
${content}

Strict Instructions:
1. Return ONLY the refined content in Markdown formatting.
2. Do NOT add any preamble, conversational introduction (e.g., "Here is your summary"), or concluding commentary.
3. Preserve key facts, figures, and technical accuracy while applying the requested transformation.`;

    const streamResult = await streamContent(fullPrompt);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (streamError) {
          console.error("Refine stream error:", streamError);
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
    console.error("Refine API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during refinement" },
      { status: 500 }
    );
  }
}
