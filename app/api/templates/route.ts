import { NextResponse } from "next/server";

export async function GET() {
  const templates = [
    { id: 1, slug: "generate-blog-title", aiPrompt: "Generate a blog title based on the given topic." },
    { id: 2, slug: "seo-meta-description", aiPrompt: "Generate an SEO-friendly meta description." },
  ];

  return NextResponse.json(templates);
}
